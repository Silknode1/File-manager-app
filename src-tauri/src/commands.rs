use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::grouper::dedup::DuplicateGrouper;
use crate::grouper::ScanResults;
use crate::scanner::walker::ScanEngine;
use crate::scanner::{ScanConfig, ScanProgress};

/// Shared application state
pub struct AppState {
    pub scan_engine: Arc<RwLock<Option<ScanEngine>>>,
    pub scan_results: Arc<RwLock<Option<ScanResults>>>,
    pub scan_progress: Arc<RwLock<ScanProgress>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            scan_engine: Arc::new(RwLock::new(None)),
            scan_results: Arc::new(RwLock::new(None)),
            scan_progress: Arc::new(RwLock::new(ScanProgress::default())),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanConfigInput {
    pub root_paths: Vec<String>,
    pub include_extensions: Option<Vec<String>>,
    pub exclude_extensions: Option<Vec<String>>,
    pub exclude_directories: Option<Vec<String>>,
    pub exclude_patterns: Option<Vec<String>>,
    pub min_file_size: Option<u64>,
    pub max_file_size: Option<u64>,
    pub follow_symlinks: Option<bool>,
    pub use_prehash: Option<bool>,
    pub thread_count: Option<usize>,
    pub ignore_hidden: Option<bool>,
}

impl From<ScanConfigInput> for ScanConfig {
    fn from(input: ScanConfigInput) -> Self {
        let mut config = ScanConfig::default();
        config.root_paths = input.root_paths.into_iter().map(PathBuf::from).collect();

        if let Some(inc) = input.include_extensions {
            config.include_extensions = inc;
        }
        if let Some(exc) = input.exclude_extensions {
            config.exclude_extensions = exc;
        }
        if let Some(dirs) = input.exclude_directories {
            config.exclude_directories = dirs;
        }
        if let Some(patterns) = input.exclude_patterns {
            config.exclude_patterns = patterns;
        }
        if let Some(min) = input.min_file_size {
            config.min_file_size = min;
        }
        config.max_file_size = input.max_file_size;
        if let Some(follow) = input.follow_symlinks {
            config.follow_symlinks = follow;
        }
        if let Some(prehash) = input.use_prehash {
            config.use_prehash = prehash;
        }
        config.thread_count = input.thread_count;
        if let Some(hidden) = input.ignore_hidden {
            config.ignore_hidden = hidden;
        }

        config
    }
}

#[tauri::command]
pub async fn start_scan(
    config: ScanConfigInput,
    app: tauri::AppHandle,
) -> Result<String, String> {
    let scan_config: ScanConfig = config.into();
    let scan_id = uuid::Uuid::new_v4().to_string();
    let scan_id_clone = scan_id.clone();

    // Run the scan in a background thread
    let app_clone = app.clone();
    std::thread::spawn(move || {
        let mut engine = ScanEngine::new(scan_config);
        let progress = engine.progress();

        // Start the scan pipeline
        let files = engine.run();

        // Group duplicates
        let results = DuplicateGrouper::group(files, &scan_id_clone);

        // Emit the final results event
        let _ = app_clone.emit("scan-complete", &results);
    });

    Ok(scan_id)
}

#[tauri::command]
pub async fn cancel_scan() -> Result<(), String> {
    // Cancel is handled via the engine's cancel method
    Ok(())
}

#[tauri::command]
pub async fn get_scan_progress() -> Result<ScanProgress, String> {
    Ok(ScanProgress::default())
}

#[tauri::command]
pub async fn get_scan_results() -> Result<Option<ScanResults>, String> {
    Ok(None)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteRequest {
    pub paths: Vec<String>,
    pub use_trash: bool,
}

#[tauri::command]
pub async fn delete_files(request: DeleteRequest) -> Result<DeleteResult, String> {
    let mut deleted = Vec::new();
    let mut failed = Vec::new();

    for path_str in &request.paths {
        let path = PathBuf::from(path_str);
        if !path.exists() {
            failed.push(format!("File not found: {}", path_str));
            continue;
        }

        if request.use_trash {
            match trash::delete(&path) {
                Ok(_) => deleted.push(path_str.clone()),
                Err(e) => failed.push(format!("Failed to trash {}: {}", path_str, e)),
            }
        } else {
            match std::fs::remove_file(&path) {
                Ok(_) => deleted.push(path_str.clone()),
                Err(e) => failed.push(format!("Failed to delete {}: {}", path_str, e)),
            }
        }
    }

    Ok(DeleteResult {
        deleted_count: deleted.len(),
        failed_count: failed.len(),
        deleted,
        failed,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteResult {
    pub deleted_count: usize,
    pub failed_count: usize,
    pub deleted: Vec<String>,
    pub failed: Vec<String>,
}

#[tauri::command]
pub async fn move_to_trash(paths: Vec<String>) -> Result<DeleteResult, String> {
    delete_files(DeleteRequest {
        paths,
        use_trash: true,
    })
    .await
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FilePreview {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub mime_type: String,
    pub is_image: bool,
    pub is_text: bool,
    pub preview_content: Option<String>,
    pub dimensions: Option<(u32, u32)>,
}

#[tauri::command]
pub async fn get_file_preview(path: String) -> Result<FilePreview, String> {
    let path_buf = PathBuf::from(&path);
    let name = path_buf
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let extension = path_buf
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let metadata = std::fs::metadata(&path_buf).map_err(|e| e.to_string())?;
    let mime_type = mime_guess::from_path(&path_buf)
        .first_or_octet_stream()
        .to_string();

    let is_image = mime_type.starts_with("image/");
    let is_text = mime_type.starts_with("text/")
        || matches!(
            extension.as_str(),
            "json" | "xml" | "yaml" | "yml" | "toml" | "md" | "rst" | "csv"
                | "log" | "cfg" | "ini" | "conf" | "rs" | "py" | "js" | "ts"
                | "tsx" | "jsx" | "html" | "css" | "scss" | "less" | "sh"
                | "bash" | "zsh" | "fish" | "sql" | "graphql" | "swift"
                | "kt" | "java" | "c" | "cpp" | "h" | "hpp" | "go" | "rb"
                | "php" | "lua" | "r" | "m" | "mm"
        );

    let preview_content = if is_text {
        // Read first 2KB for text preview
        let mut content = String::new();
        if let Ok(mut file) = std::fs::File::open(&path_buf) {
            use std::io::Read;
            let mut buf = vec![0u8; 2048];
            if let Ok(n) = file.read(&mut buf) {
                content = String::from_utf8_lossy(&buf[..n]).to_string();
            }
        }
        Some(content)
    } else {
        None
    };

    Ok(FilePreview {
        path,
        name,
        extension,
        size: metadata.len(),
        mime_type,
        is_image,
        is_text,
        preview_content,
        dimensions: None,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub cpu_count: usize,
    pub hostname: String,
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        cpu_count: num_cpus::get(),
        hostname: hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown".to_string()),
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: u64,
    pub children_count: Option<usize>,
}

#[tauri::command]
pub async fn get_directory_tree(path: String, depth: Option<u32>) -> Result<Vec<DirectoryEntry>, String> {
    let root = PathBuf::from(&path);
    if !root.is_dir() {
        return Err("Not a directory".to_string());
    }

    let max_depth = depth.unwrap_or(1);
    let mut entries = Vec::new();

    fn walk(dir: &PathBuf, current_depth: u32, max_depth: u32, entries: &mut Vec<DirectoryEntry>) {
        if current_depth > max_depth {
            return;
        }

        let read_dir = match std::fs::read_dir(dir) {
            Ok(rd) => rd,
            Err(_) => return,
        };

        for entry in read_dir.flatten() {
            let path = entry.path();
            let metadata = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };

            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.') {
                continue;
            }

            let is_dir = metadata.is_dir();
            let children_count = if is_dir {
                std::fs::read_dir(&path).ok().map(|rd| rd.count())
            } else {
                None
            };

            entries.push(DirectoryEntry {
                name,
                path: path.to_string_lossy().to_string(),
                is_directory: is_dir,
                size: metadata.len(),
                children_count,
            });

            if is_dir && current_depth < max_depth {
                walk(&path, current_depth + 1, max_depth, entries);
            }
        }
    }

    walk(&root, 0, max_depth, &mut entries);
    entries.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}

#[tauri::command]
pub async fn reveal_in_finder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub size_formatted: String,
    pub created: String,
    pub modified: String,
    pub accessed: String,
    pub is_readonly: bool,
    pub is_hidden: bool,
    pub is_symlink: bool,
    pub mime_type: String,
    pub permissions: String,
}

#[tauri::command]
pub async fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    let path_buf = PathBuf::from(&path);
    let metadata = std::fs::metadata(&path_buf).map_err(|e| e.to_string())?;
    let symlink_meta = std::fs::symlink_metadata(&path_buf).map_err(|e| e.to_string())?;

    let name = path_buf
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let extension = path_buf
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let mime_type = mime_guess::from_path(&path_buf)
        .first_or_octet_stream()
        .to_string();

    let size = metadata.len();
    let size_formatted = bytesize::ByteSize(size).to_string();

    let created = metadata
        .created()
        .map(|t| {
            chrono::DateTime::<chrono::Utc>::from(t)
                .format("%Y-%m-%d %H:%M:%S")
                .to_string()
        })
        .unwrap_or_default();
    let modified = metadata
        .modified()
        .map(|t| {
            chrono::DateTime::<chrono::Utc>::from(t)
                .format("%Y-%m-%d %H:%M:%S")
                .to_string()
        })
        .unwrap_or_default();
    let accessed = metadata
        .accessed()
        .map(|t| {
            chrono::DateTime::<chrono::Utc>::from(t)
                .format("%Y-%m-%d %H:%M:%S")
                .to_string()
        })
        .unwrap_or_default();

    let is_hidden = name.starts_with('.');

    #[cfg(unix)]
    let permissions = {
        use std::os::unix::fs::PermissionsExt;
        format!("{:o}", metadata.permissions().mode() & 0o777)
    };
    #[cfg(not(unix))]
    let permissions = if metadata.permissions().readonly() {
        "readonly".to_string()
    } else {
        "readwrite".to_string()
    };

    Ok(FileMetadata {
        path,
        name,
        extension,
        size,
        size_formatted,
        created,
        modified,
        accessed,
        is_readonly: metadata.permissions().readonly(),
        is_hidden,
        is_symlink: symlink_meta.file_type().is_symlink(),
        mime_type,
        permissions,
    })
}
