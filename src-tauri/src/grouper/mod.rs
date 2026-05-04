pub mod dedup;

use serde::{Deserialize, Serialize};

use crate::scanner::ScannedFile;

/// A group of duplicate files that share the same content hash
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub id: String,
    pub hash: String,
    pub files: Vec<ScannedFile>,
    pub file_count: usize,
    pub total_size: u64,
    pub wasted_size: u64, // total_size - single_file_size (space that could be reclaimed)
    pub extension: String,
    pub mime_type: String,
}

/// Summary of all scan results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResults {
    pub scan_id: String,
    pub duplicate_groups: Vec<DuplicateGroup>,
    pub unique_files: Vec<ScannedFile>,
    pub total_files_scanned: u64,
    pub total_duplicates: u64,
    pub total_groups: u64,
    pub total_size: u64,
    pub total_wasted_size: u64,
    pub extension_breakdown: std::collections::HashMap<String, ExtensionStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionStats {
    pub extension: String,
    pub total_files: u64,
    pub duplicate_files: u64,
    pub total_size: u64,
    pub wasted_size: u64,
}
