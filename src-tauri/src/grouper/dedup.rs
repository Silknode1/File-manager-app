use std::collections::HashMap;

use uuid::Uuid;

use super::{DuplicateGroup, ExtensionStats, ScanResults};
use crate::scanner::ScannedFile;

/// Groups scanned files by hash to find duplicates
pub struct DuplicateGrouper;

impl DuplicateGrouper {
    /// Build duplicate groups from hashed files
    pub fn group(files: Vec<ScannedFile>, scan_id: &str) -> ScanResults {
        let mut hash_groups: HashMap<String, Vec<ScannedFile>> = HashMap::new();
        let mut unique_files: Vec<ScannedFile> = Vec::new();

        // Group files by their full hash
        for file in &files {
            if let Some(ref hash) = file.full_hash {
                hash_groups
                    .entry(hash.clone())
                    .or_default()
                    .push(file.clone());
            } else {
                // Files without a full hash are unique (didn't match prehash with anyone)
                unique_files.push(file.clone());
            }
        }

        let mut duplicate_groups: Vec<DuplicateGroup> = Vec::new();
        let mut total_duplicates: u64 = 0;
        let mut total_wasted_size: u64 = 0;

        for (hash, group_files) in hash_groups {
            if group_files.len() > 1 {
                let file_count = group_files.len();
                let single_size = group_files[0].size;
                let total_size = single_size * file_count as u64;
                let wasted = total_size - single_size;

                let extension = group_files[0].extension.clone();
                let mime_type = group_files[0].mime_type.clone();

                duplicate_groups.push(DuplicateGroup {
                    id: Uuid::new_v4().to_string(),
                    hash,
                    files: group_files,
                    file_count,
                    total_size,
                    wasted_size: wasted,
                    extension,
                    mime_type,
                });

                total_duplicates += file_count as u64;
                total_wasted_size += wasted;
            } else {
                // Single file in hash group = unique
                unique_files.extend(group_files);
            }
        }

        // Sort groups by wasted size (largest first)
        duplicate_groups.sort_by(|a, b| b.wasted_size.cmp(&a.wasted_size));

        // Build extension breakdown
        let mut extension_breakdown: HashMap<String, ExtensionStats> = HashMap::new();
        for file in &files {
            let ext = if file.extension.is_empty() {
                "(none)".to_string()
            } else {
                file.extension.clone()
            };

            let stats = extension_breakdown
                .entry(ext.clone())
                .or_insert_with(|| ExtensionStats {
                    extension: ext,
                    total_files: 0,
                    duplicate_files: 0,
                    total_size: 0,
                    wasted_size: 0,
                });
            stats.total_files += 1;
            stats.total_size += file.size;
        }

        // Update duplicate counts per extension
        for group in &duplicate_groups {
            let ext = if group.extension.is_empty() {
                "(none)".to_string()
            } else {
                group.extension.clone()
            };
            if let Some(stats) = extension_breakdown.get_mut(&ext) {
                stats.duplicate_files += group.file_count as u64;
                stats.wasted_size += group.wasted_size;
            }
        }

        let total_size: u64 = files.iter().map(|f| f.size).sum();

        ScanResults {
            scan_id: scan_id.to_string(),
            total_files_scanned: files.len() as u64,
            total_duplicates,
            total_groups: duplicate_groups.len() as u64,
            total_size,
            total_wasted_size,
            duplicate_groups,
            unique_files,
            extension_breakdown,
        }
    }
}

/// Bulk selection strategies for auto-selecting duplicates
#[derive(Debug, Clone)]
pub enum SelectionStrategy {
    /// Keep the newest file, select older ones for deletion
    KeepNewest,
    /// Keep the oldest file, select newer ones for deletion
    KeepOldest,
    /// Keep the file in the shortest path, select others
    KeepShortestPath,
    /// Keep the file in a preferred directory
    KeepInDirectory(String),
}

impl SelectionStrategy {
    /// Apply strategy to a duplicate group, returning indices of files to select for deletion
    pub fn apply(&self, group: &DuplicateGroup) -> Vec<usize> {
        if group.files.len() <= 1 {
            return vec![];
        }

        match self {
            SelectionStrategy::KeepNewest => {
                let mut indexed: Vec<(usize, &chrono::DateTime<chrono::Utc>)> = group
                    .files
                    .iter()
                    .enumerate()
                    .map(|(i, f)| (i, &f.modified))
                    .collect();
                indexed.sort_by(|a, b| b.1.cmp(a.1));
                // Keep the first (newest), select the rest
                indexed.into_iter().skip(1).map(|(i, _)| i).collect()
            }
            SelectionStrategy::KeepOldest => {
                let mut indexed: Vec<(usize, &chrono::DateTime<chrono::Utc>)> = group
                    .files
                    .iter()
                    .enumerate()
                    .map(|(i, f)| (i, &f.modified))
                    .collect();
                indexed.sort_by(|a, b| a.1.cmp(b.1));
                indexed.into_iter().skip(1).map(|(i, _)| i).collect()
            }
            SelectionStrategy::KeepShortestPath => {
                let mut indexed: Vec<(usize, usize)> = group
                    .files
                    .iter()
                    .enumerate()
                    .map(|(i, f)| (i, f.path.to_string_lossy().len()))
                    .collect();
                indexed.sort_by(|a, b| a.1.cmp(&b.1));
                indexed.into_iter().skip(1).map(|(i, _)| i).collect()
            }
            SelectionStrategy::KeepInDirectory(dir) => {
                let preferred_idx = group
                    .files
                    .iter()
                    .position(|f| f.path.to_string_lossy().contains(dir.as_str()));

                match preferred_idx {
                    Some(keep) => (0..group.files.len()).filter(|&i| i != keep).collect(),
                    None => {
                        // No file in preferred dir; keep the first, select the rest
                        (1..group.files.len()).collect()
                    }
                }
            }
        }
    }
}
