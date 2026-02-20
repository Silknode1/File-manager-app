/** Format bytes to human-readable string */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Format number with commas */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/** Format milliseconds to human-readable duration */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/** Format files per second */
export function formatRate(rate: number): string {
  if (rate < 1) return `${(rate * 1000).toFixed(0)}/ks`;
  if (rate < 1000) return `${rate.toFixed(0)}/s`;
  return `${(rate / 1000).toFixed(1)}k/s`;
}

/** Truncate a file path for display */
export function truncatePath(path: string, maxLength = 60): string {
  if (path.length <= maxLength) return path;
  const parts = path.split("/");
  if (parts.length <= 3) return `...${path.slice(-maxLength)}`;
  const first = parts[0] || parts[1];
  const last = parts.slice(-2).join("/");
  return `${first}/.../${last}`;
}

/** Get the parent directory from a path */
export function getParentDir(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

/** Get file icon type based on extension */
export function getFileIconType(
  extension: string
): "image" | "video" | "audio" | "document" | "code" | "archive" | "file" {
  const ext = extension.toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "tiff", "ico", "heic"];
  const videoExts = ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "m4v"];
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"];
  const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf"];
  const codeExts = ["js", "ts", "tsx", "jsx", "py", "rs", "go", "java", "c", "cpp", "swift", "html", "css", "json"];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "dmg", "iso"];

  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  if (audioExts.includes(ext)) return "audio";
  if (docExts.includes(ext)) return "document";
  if (codeExts.includes(ext)) return "code";
  if (archiveExts.includes(ext)) return "archive";
  return "file";
}
