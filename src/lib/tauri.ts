/**
 * Tauri API bridge - wraps Tauri invoke calls for the frontend
 * Falls back to mock data when running in browser (outside Tauri)
 */

import type {
  DeleteResult,
  DirectoryEntry,
  FileMetadata,
  FilePreview,
  ScanProgress,
  ScanResults,
  SystemInfo,
} from "../types";

const IS_TAURI = "__TAURI__" in window;

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (IS_TAURI) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(command, args);
  }
  throw new Error(`Tauri not available: ${command}`);
}

export async function startScan(config: {
  root_paths: string[];
  include_extensions?: string[];
  exclude_extensions?: string[];
  exclude_directories?: string[];
  exclude_patterns?: string[];
  min_file_size?: number;
  max_file_size?: number | null;
  follow_symlinks?: boolean;
  use_prehash?: boolean;
  thread_count?: number | null;
  ignore_hidden?: boolean;
}): Promise<string> {
  return invoke<string>("start_scan", { config });
}

export async function cancelScan(): Promise<void> {
  return invoke<void>("cancel_scan");
}

export async function getScanProgress(): Promise<ScanProgress> {
  return invoke<ScanProgress>("get_scan_progress");
}

export async function getScanResults(): Promise<ScanResults | null> {
  return invoke<ScanResults | null>("get_scan_results");
}

export async function deleteFiles(
  paths: string[],
  useTrash: boolean
): Promise<DeleteResult> {
  return invoke<DeleteResult>("delete_files", {
    request: { paths, use_trash: useTrash },
  });
}

export async function moveToTrash(paths: string[]): Promise<DeleteResult> {
  return invoke<DeleteResult>("move_to_trash", { paths });
}

export async function getFilePreview(path: string): Promise<FilePreview> {
  return invoke<FilePreview>("get_file_preview", { path });
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>("get_system_info");
}

export async function getDirectoryTree(
  path: string,
  depth?: number
): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>("get_directory_tree", { path, depth });
}

export async function revealInFinder(path: string): Promise<void> {
  return invoke<void>("reveal_in_finder", { path });
}

export async function getFileMetadata(path: string): Promise<FileMetadata> {
  return invoke<FileMetadata>("get_file_metadata", { path });
}

export async function listenToEvent(
  event: string,
  callback: (payload: unknown) => void
): Promise<() => void> {
  if (IS_TAURI) {
    const { listen } = await import("@tauri-apps/api/event");
    return listen(event, (e) => callback(e.payload));
  }
  return () => {};
}

export async function openDirectoryDialog(): Promise<string | null> {
  if (IS_TAURI) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: true, multiple: false });
    return result as string | null;
  }
  return null;
}

export { IS_TAURI };
