// ============================================================
// Core Types for FileCraft File Management System
// ============================================================

export interface ScannedFile {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  modified: string;
  created: string;
  mime_type: string;
  prehash: string | null;
  full_hash: string | null;
  is_symlink: boolean;
}

export interface ScanConfig {
  root_paths: string[];
  include_extensions: string[];
  exclude_extensions: string[];
  exclude_directories: string[];
  exclude_patterns: string[];
  min_file_size: number;
  max_file_size: number | null;
  follow_symlinks: boolean;
  use_prehash: boolean;
  thread_count: number | null;
  ignore_hidden: boolean;
}

export type ScanPhase =
  | "Idle"
  | "Discovery"
  | "Filtering"
  | "Prehashing"
  | "Hashing"
  | "Grouping"
  | "Complete"
  | "Cancelled"
  | "Error";

export interface SizeDistribution {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  huge: number;
  massive: number;
}

export interface ScanProgress {
  phase: ScanPhase;
  total_files_discovered: number;
  files_filtered: number;
  files_prehashed: number;
  files_hashed: number;
  files_grouped: number;
  bytes_processed: number;
  total_bytes: number;
  current_path: string;
  elapsed_ms: number;
  estimated_remaining_ms: number | null;
  files_per_second: number;
  bytes_per_second: number;
  extension_counts: Record<string, number>;
  extension_sizes: Record<string, number>;
  size_distribution: SizeDistribution;
  is_complete: boolean;
  is_cancelled: boolean;
  errors: string[];
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  files: ScannedFile[];
  file_count: number;
  total_size: number;
  wasted_size: number;
  extension: string;
  mime_type: string;
}

export interface ExtensionStats {
  extension: string;
  total_files: number;
  duplicate_files: number;
  total_size: number;
  wasted_size: number;
}

export interface ScanResults {
  scan_id: string;
  duplicate_groups: DuplicateGroup[];
  unique_files: ScannedFile[];
  total_files_scanned: number;
  total_duplicates: number;
  total_groups: number;
  total_size: number;
  total_wasted_size: number;
  extension_breakdown: Record<string, ExtensionStats>;
}

export interface DeleteResult {
  deleted_count: number;
  failed_count: number;
  deleted: string[];
  failed: string[];
}

export interface FilePreview {
  path: string;
  name: string;
  extension: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  is_text: boolean;
  preview_content: string | null;
  dimensions: [number, number] | null;
}

export interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size: number;
  size_formatted: string;
  created: string;
  modified: string;
  accessed: string;
  is_readonly: boolean;
  is_hidden: boolean;
  is_symlink: boolean;
  mime_type: string;
  permissions: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  children_count: number | null;
}

export interface SystemInfo {
  os: string;
  cpu_count: number;
  hostname: string;
}

// App view states
export type AppView = "setup" | "scanning" | "results";

export type SelectionStrategy =
  | "keep-newest"
  | "keep-oldest"
  | "keep-shortest-path"
  | "keep-in-directory";

// File type categories for visualization
export interface FileTypeCategory {
  name: string;
  extensions: string[];
  color: string;
  icon: string;
}

export const FILE_TYPE_CATEGORIES: FileTypeCategory[] = [
  {
    name: "Images",
    extensions: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "tiff", "ico", "heic", "heif", "raw", "cr2", "nef"],
    color: "#4c6ef5",
    icon: "image",
  },
  {
    name: "Videos",
    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "m4v", "mpg", "mpeg", "3gp"],
    color: "#7950f2",
    icon: "video",
  },
  {
    name: "Audio",
    extensions: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "aiff", "opus"],
    color: "#e64980",
    icon: "music",
  },
  {
    name: "Documents",
    extensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt", "ods", "odp", "pages", "numbers", "keynote"],
    color: "#40c057",
    icon: "file-text",
  },
  {
    name: "Code",
    extensions: ["js", "ts", "tsx", "jsx", "py", "rs", "go", "java", "c", "cpp", "h", "hpp", "swift", "kt", "rb", "php", "html", "css", "scss", "json", "yaml", "yml", "toml", "xml", "sql", "sh", "bash", "md"],
    color: "#15aabf",
    icon: "code",
  },
  {
    name: "Archives",
    extensions: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "dmg", "iso"],
    color: "#fd7e14",
    icon: "archive",
  },
  {
    name: "Other",
    extensions: [],
    color: "#868e96",
    icon: "file",
  },
];

export function getFileCategory(extension: string): FileTypeCategory {
  const ext = extension.toLowerCase();
  return (
    FILE_TYPE_CATEGORIES.find((cat) => cat.extensions.includes(ext)) ||
    FILE_TYPE_CATEGORIES[FILE_TYPE_CATEGORIES.length - 1]
  );
}
