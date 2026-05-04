import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FolderPlus,
  X,
  Play,
  Sliders,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  HardDrive,
  Filter,
  Hash,
  FileSearch,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { openDirectoryDialog, startScan, IS_TAURI } from "../../lib/tauri";
import { generateMockProgress, generateMockResults } from "../../lib/mockData";
import clsx from "clsx";

export function ScanSetup() {
  const { config, updateConfig, startScan: startScanAction, setView, updateProgress, setResults } =
    useScanStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newExt, setNewExt] = useState("");
  const [newExcludeExt, setNewExcludeExt] = useState("");
  const [newExcludeDir, setNewExcludeDir] = useState("");

  const handleAddDirectory = useCallback(async () => {
    if (IS_TAURI) {
      const path = await openDirectoryDialog();
      if (path) {
        updateConfig({
          root_paths: [...config.root_paths, path],
        });
      }
    } else {
      // Demo mode: add a sample path
      const demoPaths = [
        "/Users/demo/Documents",
        "/Users/demo/Downloads",
        "/Users/demo/Pictures",
        "/Users/demo/Desktop",
      ];
      const available = demoPaths.filter((p) => !config.root_paths.includes(p));
      if (available.length > 0) {
        updateConfig({
          root_paths: [...config.root_paths, available[0]],
        });
      }
    }
  }, [config.root_paths, updateConfig]);

  const handleRemoveDirectory = (path: string) => {
    updateConfig({
      root_paths: config.root_paths.filter((p) => p !== path),
    });
  };

  const handleAddIncludeExt = () => {
    if (newExt && !config.include_extensions.includes(newExt.toLowerCase())) {
      updateConfig({
        include_extensions: [...config.include_extensions, newExt.toLowerCase()],
      });
      setNewExt("");
    }
  };

  const handleRemoveIncludeExt = (ext: string) => {
    updateConfig({
      include_extensions: config.include_extensions.filter((e) => e !== ext),
    });
  };

  const handleAddExcludeExt = () => {
    if (
      newExcludeExt &&
      !config.exclude_extensions.includes(newExcludeExt.toLowerCase())
    ) {
      updateConfig({
        exclude_extensions: [
          ...config.exclude_extensions,
          newExcludeExt.toLowerCase(),
        ],
      });
      setNewExcludeExt("");
    }
  };

  const handleRemoveExcludeExt = (ext: string) => {
    updateConfig({
      exclude_extensions: config.exclude_extensions.filter((e) => e !== ext),
    });
  };

  const handleAddExcludeDir = () => {
    if (newExcludeDir && !config.exclude_directories.includes(newExcludeDir)) {
      updateConfig({
        exclude_directories: [...config.exclude_directories, newExcludeDir],
      });
      setNewExcludeDir("");
    }
  };

  const handleRemoveExcludeDir = (dir: string) => {
    updateConfig({
      exclude_directories: config.exclude_directories.filter((d) => d !== dir),
    });
  };

  const handleStartScan = async () => {
    if (config.root_paths.length === 0) return;

    startScanAction();

    if (IS_TAURI) {
      try {
        await startScan(config);
      } catch (err) {
        console.error("Scan failed:", err);
      }
    } else {
      // Demo mode: simulate scan progress
      let phase = 0;
      const interval = setInterval(() => {
        if (phase >= 6) {
          clearInterval(interval);
          setResults(generateMockResults());
          return;
        }
        updateProgress(generateMockProgress(phase));
        phase++;
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/20 mb-2"
        >
          <FileSearch className="h-8 w-8 text-brand-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">
          Configure Your Scan
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Select directories to scan, set filters, and configure performance
          options. FileCraft uses parallel BLAKE3 hashing for blazing-fast
          duplicate detection.
        </p>
      </div>

      {/* Target Directories */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/20">
            <HardDrive className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Target Directories
            </h3>
            <p className="text-xs text-gray-500">
              Select the directories you want to scan for duplicates
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {config.root_paths.map((path) => (
            <div
              key={path}
              className="flex items-center justify-between rounded-lg bg-dark-surface-2 px-3 py-2 group"
            >
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FolderPlus className="h-4 w-4 text-brand-400" />
                <span className="font-mono text-xs">{path}</span>
              </div>
              <button
                onClick={() => handleRemoveDirectory(path)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-surface-3 text-gray-500 hover:text-accent-red transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleAddDirectory} className="btn-secondary w-full">
          <FolderPlus className="h-4 w-4" />
          Add Directory
        </button>
      </div>

      {/* Extension Filters */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal/20">
            <Filter className="h-4 w-4 text-accent-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Extension Filters
            </h3>
            <p className="text-xs text-gray-500">
              Include or exclude specific file types
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Include extensions */}
          <div>
            <label className="label">Include Only (empty = all)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExt}
                onChange={(e) => setNewExt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddIncludeExt()}
                placeholder="e.g., jpg"
                className="input flex-1"
              />
              <button onClick={handleAddIncludeExt} className="btn-secondary">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {config.include_extensions.map((ext) => (
                <span
                  key={ext}
                  className="badge-info group cursor-pointer"
                  onClick={() => handleRemoveIncludeExt(ext)}
                >
                  .{ext}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                </span>
              ))}
            </div>
          </div>

          {/* Exclude extensions */}
          <div>
            <label className="label">Exclude Extensions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExcludeExt}
                onChange={(e) => setNewExcludeExt(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddExcludeExt()
                }
                placeholder="e.g., app"
                className="input flex-1"
              />
              <button
                onClick={handleAddExcludeExt}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {config.exclude_extensions.map((ext) => (
                <span
                  key={ext}
                  className="badge-warning group cursor-pointer"
                  onClick={() => handleRemoveExcludeExt(ext)}
                >
                  .{ext}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Excluded Directories */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/20">
            <Shield className="h-4 w-4 text-accent-orange" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Excluded Directories
            </h3>
            <p className="text-xs text-gray-500">
              Skip these directories during scanning
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newExcludeDir}
            onChange={(e) => setNewExcludeDir(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleAddExcludeDir()
            }
            placeholder="e.g., node_modules"
            className="input flex-1"
          />
          <button onClick={handleAddExcludeDir} className="btn-secondary">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {config.exclude_directories.map((dir) => (
            <span
              key={dir}
              className="badge-danger group cursor-pointer"
              onClick={() => handleRemoveExcludeDir(dir)}
            >
              {dir}
              <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
            </span>
          ))}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-violet/20">
            <Hash className="h-4 w-4 text-accent-violet" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Hashing & Performance
            </h3>
            <p className="text-xs text-gray-500">
              Configure scanning performance and hashing behavior
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 rounded-lg bg-dark-surface-2 px-3 py-2.5 cursor-pointer hover:bg-dark-surface-3 transition-colors">
            <input
              type="checkbox"
              checked={config.use_prehash}
              onChange={(e) =>
                updateConfig({ use_prehash: e.target.checked })
              }
              className="rounded border-gray-600 bg-dark-surface-3 text-brand-500 focus:ring-brand-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-200">
                Two-Stage Hashing
              </div>
              <div className="text-xs text-gray-500">
                Head+tail prehash for faster scans
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg bg-dark-surface-2 px-3 py-2.5 cursor-pointer hover:bg-dark-surface-3 transition-colors">
            <input
              type="checkbox"
              checked={config.follow_symlinks}
              onChange={(e) =>
                updateConfig({ follow_symlinks: e.target.checked })
              }
              className="rounded border-gray-600 bg-dark-surface-3 text-brand-500 focus:ring-brand-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-200">
                Follow Symlinks
              </div>
              <div className="text-xs text-gray-500">
                Follow symbolic links during walk
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg bg-dark-surface-2 px-3 py-2.5 cursor-pointer hover:bg-dark-surface-3 transition-colors">
            <input
              type="checkbox"
              checked={config.ignore_hidden}
              onChange={(e) =>
                updateConfig({ ignore_hidden: e.target.checked })
              }
              className="rounded border-gray-600 bg-dark-surface-3 text-brand-500 focus:ring-brand-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-200">
                Ignore Hidden Files
              </div>
              <div className="text-xs text-gray-500">
                Skip files starting with a dot
              </div>
            </div>
          </label>

          <div className="rounded-lg bg-dark-surface-2 px-3 py-2.5">
            <label className="label mb-1">Minimum File Size</label>
            <select
              value={config.min_file_size}
              onChange={(e) =>
                updateConfig({ min_file_size: parseInt(e.target.value) })
              }
              className="input"
            >
              <option value="0">No minimum</option>
              <option value="1024">1 KB</option>
              <option value="10240">10 KB</option>
              <option value="102400">100 KB</option>
              <option value="1048576">1 MB</option>
              <option value="10485760">10 MB</option>
              <option value="104857600">100 MB</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-surface-3">
              <Sliders className="h-4 w-4 text-gray-400" />
            </div>
            <span className="font-medium text-gray-300">
              Advanced Settings
            </span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            <div>
              <label className="label">Thread Count (0 = auto)</label>
              <input
                type="number"
                min={0}
                max={32}
                value={config.thread_count ?? 0}
                onChange={(e) =>
                  updateConfig({
                    thread_count:
                      parseInt(e.target.value) || null,
                  })
                }
                className="input w-32"
              />
              <p className="text-xs text-gray-600 mt-1">
                Leave at 0 for automatic optimal thread count
              </p>
            </div>

            <div>
              <label className="label">Max File Size (0 = no limit)</label>
              <select
                value={config.max_file_size ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateConfig({ max_file_size: val || null });
                }}
                className="input w-48"
              >
                <option value="0">No limit</option>
                <option value="104857600">100 MB</option>
                <option value="1073741824">1 GB</option>
                <option value="5368709120">5 GB</option>
                <option value="10737418240">10 GB</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Start Scan Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleStartScan}
        disabled={config.root_paths.length === 0}
        className={clsx(
          "w-full rounded-xl py-4 text-base font-semibold transition-all duration-300",
          config.root_paths.length > 0
            ? "bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-glow hover:shadow-glow-lg"
            : "bg-dark-surface-3 text-gray-600 cursor-not-allowed"
        )}
      >
        <div className="flex items-center justify-center gap-3">
          <Zap className="h-5 w-5" />
          {config.root_paths.length > 0
            ? `Start Scanning ${config.root_paths.length} Director${config.root_paths.length > 1 ? "ies" : "y"}`
            : "Add a Directory to Begin"}
        </div>
      </motion.button>
    </motion.div>
  );
}
