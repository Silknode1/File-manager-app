use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

use crossbeam_channel::Sender;
use dashmap::DashMap;
use parking_lot::RwLock;
use rayon::prelude::*;
use walkdir::WalkDir;

use super::filter::FileFilter;
use super::hasher::FileHasher;
use super::{ScanConfig, ScanPhase, ScanProgress, ScannedFile, SizeDistribution};

/// Manages the complete scan pipeline with real-time progress reporting
pub struct ScanEngine {
    config: ScanConfig,
    progress: Arc<RwLock<ScanProgress>>,
    cancelled: Arc<AtomicBool>,
    start_time: Option<Instant>,
}

impl ScanEngine {
    pub fn new(config: ScanConfig) -> Self {
        Self {
            config,
            progress: Arc::new(RwLock::new(ScanProgress::default())),
            cancelled: Arc::new(AtomicBool::new(false)),
            start_time: None,
        }
    }

    pub fn progress(&self) -> Arc<RwLock<ScanProgress>> {
        self.progress.clone()
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::SeqCst);
        let mut progress = self.progress.write();
        progress.phase = ScanPhase::Cancelled;
        progress.is_cancelled = true;
    }

    /// Execute the full scan pipeline: Discovery -> Filter -> Prehash -> Hash -> Group
    pub fn run(&mut self) -> Vec<ScannedFile> {
        self.start_time = Some(Instant::now());

        // Phase 1: Discovery
        let discovered = self.discover_files();
        if self.is_cancelled() {
            return vec![];
        }

        // Phase 2: Filtering
        let filtered = self.filter_files(discovered);
        if self.is_cancelled() {
            return vec![];
        }

        // Phase 3: Prehashing (optional)
        let prehashed = if self.config.use_prehash {
            self.prehash_files(filtered)
        } else {
            filtered
        };
        if self.is_cancelled() {
            return vec![];
        }

        // Phase 4: Full hashing
        let hashed = self.hash_files(prehashed);
        if self.is_cancelled() {
            return vec![];
        }

        // Mark complete
        {
            let mut progress = self.progress.write();
            progress.phase = ScanPhase::Complete;
            progress.is_complete = true;
            if let Some(start) = self.start_time {
                progress.elapsed_ms = start.elapsed().as_millis() as u64;
            }
        }

        hashed
    }

    fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::SeqCst)
    }

    /// Phase 1: Walk the filesystem to discover all candidate files
    fn discover_files(&self) -> Vec<ScannedFile> {
        {
            let mut progress = self.progress.write();
            progress.phase = ScanPhase::Discovery;
        }

        let files: Arc<parking_lot::Mutex<Vec<ScannedFile>>> =
            Arc::new(parking_lot::Mutex::new(Vec::new()));
        let counter = Arc::new(AtomicU64::new(0));
        let total_bytes = Arc::new(AtomicU64::new(0));
        let ext_counts: Arc<DashMap<String, u64>> = Arc::new(DashMap::new());
        let ext_sizes: Arc<DashMap<String, u64>> = Arc::new(DashMap::new());
        let size_dist = Arc::new(parking_lot::Mutex::new(SizeDistribution::default()));
        let progress = self.progress.clone();
        let cancelled = self.cancelled.clone();

        // Walk each root path in parallel
        self.config.root_paths.par_iter().for_each(|root| {
            if cancelled.load(Ordering::SeqCst) {
                return;
            }

            let walker = WalkDir::new(root)
                .follow_links(self.config.follow_symlinks)
                .into_iter()
                .filter_entry(|e| {
                    // Skip hidden files/dirs if configured
                    if self.config.ignore_hidden {
                        if let Some(name) = e.file_name().to_str() {
                            if name.starts_with('.') && name != "." {
                                return false;
                            }
                        }
                    }
                    // Skip excluded directories
                    if e.file_type().is_dir() {
                        if let Some(name) = e.file_name().to_str() {
                            if self.config.exclude_directories.iter().any(|d| d == name) {
                                return false;
                            }
                            // Check for macOS directory extensions
                            if self
                                .config
                                .exclude_extensions
                                .iter()
                                .any(|ext| name.ends_with(&format!(".{}", ext)))
                            {
                                return false;
                            }
                        }
                    }
                    true
                });

            for entry in walker {
                if cancelled.load(Ordering::SeqCst) {
                    return;
                }

                let entry = match entry {
                    Ok(e) => e,
                    Err(err) => {
                        let mut p = progress.write();
                        p.errors.push(format!("Walk error: {}", err));
                        continue;
                    }
                };

                if !entry.file_type().is_file() {
                    continue;
                }

                let path = entry.path().to_path_buf();
                let metadata = match entry.metadata() {
                    Ok(m) => m,
                    Err(err) => {
                        let mut p = progress.write();
                        p.errors.push(format!("Metadata error for {:?}: {}", path, err));
                        continue;
                    }
                };

                let size = metadata.len();
                let is_symlink = entry.path_is_symlink();

                let file = ScannedFile::new(path, size, is_symlink);

                // Update extension stats
                if !file.extension.is_empty() {
                    *ext_counts.entry(file.extension.clone()).or_insert(0) += 1;
                    *ext_sizes.entry(file.extension.clone()).or_insert(0) += size;
                } else {
                    *ext_counts.entry("(none)".to_string()).or_insert(0) += 1;
                    *ext_sizes.entry("(none)".to_string()).or_insert(0) += size;
                }

                // Update size distribution
                {
                    let mut sd = size_dist.lock();
                    sd.add(size);
                }

                counter.fetch_add(1, Ordering::Relaxed);
                total_bytes.fetch_add(size, Ordering::Relaxed);

                // Update progress periodically
                let count = counter.load(Ordering::Relaxed);
                if count % 500 == 0 {
                    let mut p = progress.write();
                    p.total_files_discovered = count;
                    p.total_bytes = total_bytes.load(Ordering::Relaxed);
                    p.current_path = file.path.to_string_lossy().to_string();
                    p.extension_counts = ext_counts
                        .iter()
                        .map(|e| (e.key().clone(), *e.value()))
                        .collect();
                    p.extension_sizes = ext_sizes
                        .iter()
                        .map(|e| (e.key().clone(), *e.value()))
                        .collect();
                    p.size_distribution = size_dist.lock().clone();

                    if let Some(start) = self.start_time {
                        let elapsed = start.elapsed().as_millis() as u64;
                        p.elapsed_ms = elapsed;
                        if elapsed > 0 {
                            p.files_per_second = count as f64 / (elapsed as f64 / 1000.0);
                        }
                    }
                }

                files.lock().push(file);
            }
        });

        let result = files.lock().clone();

        // Final progress update for discovery
        {
            let mut p = self.progress.write();
            p.total_files_discovered = result.len() as u64;
            p.total_bytes = total_bytes.load(Ordering::Relaxed);
            p.extension_counts = ext_counts
                .iter()
                .map(|e| (e.key().clone(), *e.value()))
                .collect();
            p.extension_sizes = ext_sizes
                .iter()
                .map(|e| (e.key().clone(), *e.value()))
                .collect();
            p.size_distribution = size_dist.lock().clone();
        }

        result
    }

    /// Phase 2: Apply include/exclude filters
    fn filter_files(&self, files: Vec<ScannedFile>) -> Vec<ScannedFile> {
        {
            let mut progress = self.progress.write();
            progress.phase = ScanPhase::Filtering;
        }

        let filter = FileFilter::new(&self.config);
        let filtered: Vec<ScannedFile> = files
            .into_par_iter()
            .filter(|f| filter.should_include(f))
            .collect();

        {
            let mut p = self.progress.write();
            p.files_filtered = p.total_files_discovered - filtered.len() as u64;
        }

        filtered
    }

    /// Phase 3: Prehash files (head+tail hash for quick duplicate detection)
    fn prehash_files(&self, mut files: Vec<ScannedFile>) -> Vec<ScannedFile> {
        {
            let mut progress = self.progress.write();
            progress.phase = ScanPhase::Prehashing;
        }

        let hasher = FileHasher::new(self.config.chunk_size);
        let prehashed_count = Arc::new(AtomicU64::new(0));
        let progress = self.progress.clone();
        let cancelled = self.cancelled.clone();

        files.par_iter_mut().for_each(|file| {
            if cancelled.load(Ordering::SeqCst) {
                return;
            }

            match hasher.prehash(&file.path) {
                Ok(hash) => {
                    file.prehash = Some(hash);
                    let count = prehashed_count.fetch_add(1, Ordering::Relaxed) + 1;
                    if count % 200 == 0 {
                        let mut p = progress.write();
                        p.files_prehashed = count;
                        p.current_path = file.path.to_string_lossy().to_string();
                    }
                }
                Err(err) => {
                    let mut p = progress.write();
                    p.errors.push(format!(
                        "Prehash error for {:?}: {}",
                        file.path, err
                    ));
                }
            }
        });

        {
            let mut p = self.progress.write();
            p.files_prehashed = files.len() as u64;
        }

        files
    }

    /// Phase 4: Full BLAKE3 hash (only files with matching prehashes if prehash was used)
    fn hash_files(&self, mut files: Vec<ScannedFile>) -> Vec<ScannedFile> {
        {
            let mut progress = self.progress.write();
            progress.phase = ScanPhase::Hashing;
        }

        let hasher = FileHasher::new(self.config.chunk_size);
        let hashed_count = Arc::new(AtomicU64::new(0));
        let bytes_processed = Arc::new(AtomicU64::new(0));
        let progress = self.progress.clone();
        let cancelled = self.cancelled.clone();

        // If prehash was used, only hash files that share a prehash with at least one other file
        let needs_full_hash: std::collections::HashSet<usize> = if self.config.use_prehash {
            let mut prehash_groups: std::collections::HashMap<String, Vec<usize>> =
                std::collections::HashMap::new();
            for (idx, file) in files.iter().enumerate() {
                if let Some(ref ph) = file.prehash {
                    prehash_groups
                        .entry(ph.clone())
                        .or_default()
                        .push(idx);
                }
            }
            prehash_groups
                .into_values()
                .filter(|group| group.len() > 1)
                .flatten()
                .collect()
        } else {
            (0..files.len()).collect()
        };

        let thread_count = self.config.thread_count.unwrap_or_else(num_cpus::get);
        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(thread_count)
            .build()
            .unwrap_or_else(|_| rayon::ThreadPoolBuilder::new().build().unwrap());

        pool.install(|| {
            files
                .par_iter_mut()
                .enumerate()
                .for_each(|(idx, file)| {
                    if cancelled.load(Ordering::SeqCst) {
                        return;
                    }

                    if !needs_full_hash.contains(&idx) {
                        return;
                    }

                    match hasher.full_hash(&file.path) {
                        Ok(hash) => {
                            file.full_hash = Some(hash);
                            let count = hashed_count.fetch_add(1, Ordering::Relaxed) + 1;
                            let bytes =
                                bytes_processed.fetch_add(file.size, Ordering::Relaxed) + file.size;

                            if count % 100 == 0 {
                                let mut p = progress.write();
                                p.files_hashed = count;
                                p.bytes_processed = bytes;
                                p.current_path = file.path.to_string_lossy().to_string();
                                if let Some(start) = self.start_time {
                                    let elapsed = start.elapsed().as_millis() as u64;
                                    p.elapsed_ms = elapsed;
                                    if elapsed > 0 {
                                        p.bytes_per_second =
                                            bytes as f64 / (elapsed as f64 / 1000.0);
                                    }
                                }
                            }
                        }
                        Err(err) => {
                            let mut p = progress.write();
                            p.errors.push(format!(
                                "Hash error for {:?}: {}",
                                file.path, err
                            ));
                        }
                    }
                });
        });

        {
            let mut p = self.progress.write();
            p.files_hashed = hashed_count.load(Ordering::Relaxed);
            p.bytes_processed = bytes_processed.load(Ordering::Relaxed);
        }

        files
    }
}
