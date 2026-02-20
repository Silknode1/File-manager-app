import { create } from "zustand";
import type {
  AppView,
  DuplicateGroup,
  ScanConfig,
  ScanProgress,
  ScanResults,
} from "../types";

interface ScanStore {
  // Current view
  view: AppView;
  setView: (view: AppView) => void;

  // Scan configuration
  config: ScanConfig;
  updateConfig: (partial: Partial<ScanConfig>) => void;
  resetConfig: () => void;

  // Scan state
  scanId: string | null;
  isScanning: boolean;
  progress: ScanProgress;
  updateProgress: (progress: ScanProgress) => void;

  // Results
  results: ScanResults | null;
  setResults: (results: ScanResults) => void;

  // Selection state for results
  selectedFiles: Set<string>;
  toggleFileSelection: (fileId: string) => void;
  selectAll: (groupId: string) => void;
  deselectAll: (groupId: string) => void;
  applyBulkSelection: (
    strategy: string,
    groups: DuplicateGroup[]
  ) => void;
  clearSelection: () => void;

  // Preview state
  previewFile: string | null;
  setPreviewFile: (path: string | null) => void;

  // Scan actions
  startScan: () => void;
  cancelScan: () => void;
  resetScan: () => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const defaultConfig: ScanConfig = {
  root_paths: [],
  include_extensions: [],
  exclude_extensions: ["app", "bundle", "framework", "kext", "plugin"],
  exclude_directories: [
    ".git",
    "node_modules",
    ".Trash",
    "Library",
    ".Spotlight-V100",
    ".fseventsd",
  ],
  exclude_patterns: [],
  min_file_size: 0,
  max_file_size: null,
  follow_symlinks: false,
  use_prehash: true,
  thread_count: null,
  ignore_hidden: true,
};

const defaultProgress: ScanProgress = {
  phase: "Idle",
  total_files_discovered: 0,
  files_filtered: 0,
  files_prehashed: 0,
  files_hashed: 0,
  files_grouped: 0,
  bytes_processed: 0,
  total_bytes: 0,
  current_path: "",
  elapsed_ms: 0,
  estimated_remaining_ms: null,
  files_per_second: 0,
  bytes_per_second: 0,
  extension_counts: {},
  extension_sizes: {},
  size_distribution: {
    tiny: 0,
    small: 0,
    medium: 0,
    large: 0,
    huge: 0,
    massive: 0,
  },
  is_complete: false,
  is_cancelled: false,
  errors: [],
};

export const useScanStore = create<ScanStore>((set, get) => ({
  view: "setup",
  setView: (view) => set({ view }),

  config: { ...defaultConfig },
  updateConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),
  resetConfig: () => set({ config: { ...defaultConfig } }),

  scanId: null,
  isScanning: false,
  progress: { ...defaultProgress },
  updateProgress: (progress) => set({ progress }),

  results: null,
  setResults: (results) =>
    set({ results, view: "results", isScanning: false }),

  selectedFiles: new Set<string>(),
  toggleFileSelection: (fileId) =>
    set((state) => {
      const next = new Set(state.selectedFiles);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return { selectedFiles: next };
    }),
  selectAll: (groupId) =>
    set((state) => {
      const group = state.results?.duplicate_groups.find(
        (g) => g.id === groupId
      );
      if (!group) return state;
      const next = new Set(state.selectedFiles);
      // Select all except the first file (keep one)
      group.files.slice(1).forEach((f) => next.add(f.id));
      return { selectedFiles: next };
    }),
  deselectAll: (groupId) =>
    set((state) => {
      const group = state.results?.duplicate_groups.find(
        (g) => g.id === groupId
      );
      if (!group) return state;
      const next = new Set(state.selectedFiles);
      group.files.forEach((f) => next.delete(f.id));
      return { selectedFiles: next };
    }),
  applyBulkSelection: (strategy, groups) =>
    set((state) => {
      const next = new Set<string>();
      for (const group of groups) {
        if (group.files.length <= 1) continue;

        let keepIndex = 0;
        switch (strategy) {
          case "keep-newest": {
            let newestIdx = 0;
            let newestTime = group.files[0].modified;
            group.files.forEach((f, i) => {
              if (f.modified > newestTime) {
                newestTime = f.modified;
                newestIdx = i;
              }
            });
            keepIndex = newestIdx;
            break;
          }
          case "keep-oldest": {
            let oldestIdx = 0;
            let oldestTime = group.files[0].modified;
            group.files.forEach((f, i) => {
              if (f.modified < oldestTime) {
                oldestTime = f.modified;
                oldestIdx = i;
              }
            });
            keepIndex = oldestIdx;
            break;
          }
          case "keep-shortest-path": {
            let shortestIdx = 0;
            let shortestLen = group.files[0].path.length;
            group.files.forEach((f, i) => {
              if (f.path.length < shortestLen) {
                shortestLen = f.path.length;
                shortestIdx = i;
              }
            });
            keepIndex = shortestIdx;
            break;
          }
          default:
            keepIndex = 0;
        }

        group.files.forEach((f, i) => {
          if (i !== keepIndex) {
            next.add(f.id);
          }
        });
      }
      return { selectedFiles: next };
    }),
  clearSelection: () => set({ selectedFiles: new Set() }),

  previewFile: null,
  setPreviewFile: (path) => set({ previewFile: path }),

  startScan: () =>
    set({
      isScanning: true,
      view: "scanning",
      progress: { ...defaultProgress },
      results: null,
      selectedFiles: new Set(),
    }),
  cancelScan: () =>
    set((state) => ({
      isScanning: false,
      progress: {
        ...state.progress,
        phase: "Cancelled",
        is_cancelled: true,
      },
    })),
  resetScan: () =>
    set({
      view: "setup",
      isScanning: false,
      scanId: null,
      progress: { ...defaultProgress },
      results: null,
      selectedFiles: new Set(),
      previewFile: null,
    }),

  darkMode: true,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { darkMode: next };
    }),

  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
