pub mod filter;
pub mod hasher;
pub mod walker;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

/// Represents a discovered file with its metadata and hash information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannedFile {
    pub id: String,
    pub path: PathBuf,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub modified: DateTime<Utc>,
    pub created: DateTime<Utc>,
    pub mime_type: String,
    pub prehash: Option<String>,
    pub full_hash: Option<String>,
    pub is_symlink: bool,
}

impl ScannedFile {
    pub fn new(path: PathBuf, size: u64, is_symlink: bool) -> Self {
        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let extension = path
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase())
            .unwrap_or_default();
        let mime_type = mime_guess::from_path(&path)
            .first_or_octet_stream()
            .to_string();

        let metadata = std::fs::metadata(&path);
        let (modified, created) = metadata
            .map(|m| {
                let modified = m
                    .modified()
                    .map(DateTime::<Utc>::from)
                    .unwrap_or_default();
                let created = m.created().map(DateTime::<Utc>::from).unwrap_or_default();
                (modified, created)
            })
            .unwrap_or_default();

        Self {
            id: Uuid::new_v4().to_string(),
            path,
            name,
            extension,
            size,
            modified,
            created,
            mime_type,
            prehash: None,
            full_hash: None,
            is_symlink,
        }
    }
}

/// Configuration for a scan operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanConfig {
    pub root_paths: Vec<PathBuf>,
    pub include_extensions: Vec<String>,
    pub exclude_extensions: Vec<String>,
    pub exclude_directories: Vec<String>,
    pub exclude_patterns: Vec<String>,
    pub min_file_size: u64,
    pub max_file_size: Option<u64>,
    pub follow_symlinks: bool,
    pub use_prehash: bool,
    pub thread_count: Option<usize>,
    pub chunk_size: Option<usize>,
    pub ignore_hidden: bool,
    pub ignore_system: bool,
}

impl Default for ScanConfig {
    fn default() -> Self {
        Self {
            root_paths: vec![],
            include_extensions: vec![],
            exclude_extensions: vec![
                "app".into(),
                "bundle".into(),
                "framework".into(),
                "kext".into(),
                "plugin".into(),
            ],
            exclude_directories: vec![
                ".git".into(),
                "node_modules".into(),
                ".Trash".into(),
                "Library".into(),
                ".Spotlight-V100".into(),
                ".fseventsd".into(),
            ],
            exclude_patterns: vec![],
            min_file_size: 0,
            max_file_size: None,
            follow_symlinks: false,
            use_prehash: true,
            thread_count: None,
            chunk_size: None,
            ignore_hidden: true,
            ignore_system: true,
        }
    }
}

/// Real-time progress information for the scan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub phase: ScanPhase,
    pub total_files_discovered: u64,
    pub files_filtered: u64,
    pub files_prehashed: u64,
    pub files_hashed: u64,
    pub files_grouped: u64,
    pub bytes_processed: u64,
    pub total_bytes: u64,
    pub current_path: String,
    pub elapsed_ms: u64,
    pub estimated_remaining_ms: Option<u64>,
    pub files_per_second: f64,
    pub bytes_per_second: f64,
    /// Breakdown by extension { ext: count }
    pub extension_counts: std::collections::HashMap<String, u64>,
    /// Breakdown by extension { ext: total_bytes }
    pub extension_sizes: std::collections::HashMap<String, u64>,
    /// Size distribution buckets
    pub size_distribution: SizeDistribution,
    pub is_complete: bool,
    pub is_cancelled: bool,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ScanPhase {
    Idle,
    Discovery,
    Filtering,
    Prehashing,
    Hashing,
    Grouping,
    Complete,
    Cancelled,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SizeDistribution {
    pub tiny: u64,      // < 1KB
    pub small: u64,     // 1KB - 100KB
    pub medium: u64,    // 100KB - 1MB
    pub large: u64,     // 1MB - 100MB
    pub huge: u64,      // 100MB - 1GB
    pub massive: u64,   // > 1GB
}

impl SizeDistribution {
    pub fn add(&mut self, size: u64) {
        match size {
            0..=1023 => self.tiny += 1,
            1024..=102399 => self.small += 1,
            102400..=1048575 => self.medium += 1,
            1048576..=104857599 => self.large += 1,
            104857600..=1073741823 => self.huge += 1,
            _ => self.massive += 1,
        }
    }
}

impl Default for ScanProgress {
    fn default() -> Self {
        Self {
            phase: ScanPhase::Idle,
            total_files_discovered: 0,
            files_filtered: 0,
            files_prehashed: 0,
            files_hashed: 0,
            files_grouped: 0,
            bytes_processed: 0,
            total_bytes: 0,
            current_path: String::new(),
            elapsed_ms: 0,
            estimated_remaining_ms: None,
            files_per_second: 0.0,
            bytes_per_second: 0.0,
            extension_counts: std::collections::HashMap::new(),
            extension_sizes: std::collections::HashMap::new(),
            size_distribution: SizeDistribution::default(),
            is_complete: false,
            is_cancelled: false,
            errors: vec![],
        }
    }
}
