import { Moon, Sun, RotateCcw } from "lucide-react";
import { useScanStore } from "../../store/scanStore";

export function Header() {
  const { view, darkMode, toggleDarkMode, resetScan, isScanning } =
    useScanStore();

  const titles: Record<string, string> = {
    setup: "Scan Configuration",
    scanning: "Scanning in Progress",
    results: "Scan Results",
  };

  const subtitles: Record<string, string> = {
    setup: "Configure your scan parameters and target directories",
    scanning: "Real-time scan progress and file analysis",
    results: "Review duplicate groups and manage files",
  };

  return (
    <header className="titlebar-drag-region flex items-center justify-between border-b border-gray-800 bg-dark-surface-1/50 backdrop-blur-sm px-6 py-4">
      {/* macOS traffic light spacer */}
      <div className="w-16" />

      <div className="flex-1 titlebar-no-drag">
        <h1 className="text-lg font-semibold text-white">{titles[view]}</h1>
        <p className="text-xs text-gray-500">{subtitles[view]}</p>
      </div>

      <div className="flex items-center gap-2 titlebar-no-drag">
        {(view === "results" || view === "scanning") && !isScanning && (
          <button onClick={resetScan} className="btn-ghost text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            New Scan
          </button>
        )}
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-400 hover:bg-dark-surface-2 hover:text-gray-200 transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
