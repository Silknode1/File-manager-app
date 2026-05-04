use super::{ScanConfig, ScannedFile};

/// Applies include/exclude rules to filter scanned files
pub struct FileFilter {
    include_extensions: Vec<String>,
    exclude_extensions: Vec<String>,
    exclude_patterns: Vec<glob::Pattern>,
    min_file_size: u64,
    max_file_size: Option<u64>,
    ignore_system: bool,
}

impl FileFilter {
    pub fn new(config: &ScanConfig) -> Self {
        let exclude_patterns = config
            .exclude_patterns
            .iter()
            .filter_map(|p| glob::Pattern::new(p).ok())
            .collect();

        Self {
            include_extensions: config
                .include_extensions
                .iter()
                .map(|e| e.to_lowercase())
                .collect(),
            exclude_extensions: config
                .exclude_extensions
                .iter()
                .map(|e| e.to_lowercase())
                .collect(),
            exclude_patterns,
            min_file_size: config.min_file_size,
            max_file_size: config.max_file_size,
            ignore_system: config.ignore_system,
        }
    }

    pub fn should_include(&self, file: &ScannedFile) -> bool {
        // Size filter
        if file.size < self.min_file_size {
            return false;
        }
        if let Some(max) = self.max_file_size {
            if file.size > max {
                return false;
            }
        }

        // Extension include filter (if specified, ONLY include these)
        if !self.include_extensions.is_empty()
            && !self.include_extensions.contains(&file.extension)
        {
            return false;
        }

        // Extension exclude filter
        if self.exclude_extensions.contains(&file.extension) {
            return false;
        }

        // Pattern exclude filter
        let path_str = file.path.to_string_lossy();
        for pattern in &self.exclude_patterns {
            if pattern.matches(&path_str) {
                return false;
            }
        }

        // System file filter
        if self.ignore_system {
            if let Some(name) = file.path.file_name() {
                let name_str = name.to_string_lossy();
                if name_str == ".DS_Store"
                    || name_str == "Thumbs.db"
                    || name_str == "desktop.ini"
                    || name_str.starts_with("._")
                {
                    return false;
                }
            }
        }

        true
    }
}
