import { motion } from "framer-motion";
import {
  Folder,
  Scan,
  BarChart3,
  Settings,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import clsx from "clsx";

const navItems = [
  { id: "setup" as const, icon: Scan, label: "Scan Setup" },
  { id: "scanning" as const, icon: Zap, label: "Live Scan" },
  { id: "results" as const, icon: BarChart3, label: "Results" },
];

export function Sidebar() {
  const { view, setView, sidebarCollapsed, toggleSidebar, isScanning, results } =
    useScanStore();

  return (
    <motion.aside
      className={clsx(
        "flex flex-col border-r border-gray-800 bg-dark-surface-1 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
      layout
    >
      {/* Logo / Title bar drag region */}
      <div className="titlebar-drag-region flex items-center gap-3 px-4 pt-8 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-glow">
          <HardDrive className="h-4 w-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold text-gradient titlebar-no-drag"
          >
            FileCraft
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = view === item.id;
          const isDisabled =
            (item.id === "scanning" && !isScanning) ||
            (item.id === "results" && !results);

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setView(item.id)}
              disabled={isDisabled}
              className={clsx(
                "titlebar-no-drag flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-600/20 text-brand-400 shadow-sm"
                  : isDisabled
                    ? "cursor-not-allowed text-gray-600"
                    : "text-gray-400 hover:bg-dark-surface-2 hover:text-gray-200"
              )}
            >
              <item.icon
                className={clsx("h-5 w-5 flex-shrink-0", isActive && "text-brand-400")}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!sidebarCollapsed && item.id === "scanning" && isScanning && (
                <span className="ml-auto h-2 w-2 rounded-full bg-accent-green animate-pulse-gentle" />
              )}
              {!sidebarCollapsed && item.id === "results" && results && (
                <span className="badge-primary ml-auto">
                  {results.total_groups}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-800 px-2 py-3">
        <button
          onClick={toggleSidebar}
          className="titlebar-no-drag flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-dark-surface-2 hover:text-gray-300 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
