import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  CheckSquare,
  Square,
  BarChart3,
  Layers,
  FileWarning,
  HardDrive,
  TrendingDown,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { formatBytes, formatNumber } from "../../lib/format";
import { StorageTreemap } from "../viz/StorageTreemap";
import { FileTypeChart } from "../viz/FileTypeChart";
import { DuplicateGroupCard } from "./DuplicateGroupCard";
import { BulkActions } from "./BulkActions";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { SelectionStrategy } from "../../types";
import clsx from "clsx";

export function ResultsView() {
  const { results, selectedFiles, clearSelection } = useScanStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filterExt, setFilterExt] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"wasted" | "count" | "size">("wasted");
  const [showViz, setShowViz] = useState(true);

  if (!results) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No results available
      </div>
    );
  }

  const filteredGroups = results.duplicate_groups
    .filter((g) => !filterExt || g.extension === filterExt)
    .sort((a, b) => {
      switch (sortBy) {
        case "wasted":
          return b.wasted_size - a.wasted_size;
        case "count":
          return b.file_count - a.file_count;
        case "size":
          return b.total_size - a.total_size;
        default:
          return 0;
      }
    });

  const extensionList = [
    ...new Set(results.duplicate_groups.map((g) => g.extension)),
  ].sort();

  // Build extension counts/sizes from results for visualizations
  const extCounts: Record<string, number> = {};
  const extSizes: Record<string, number> = {};
  for (const [ext, stats] of Object.entries(results.extension_breakdown)) {
    extCounts[ext] = stats.total_files;
    extSizes[ext] = stats.total_size;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard
          icon={BarChart3}
          label="Files Scanned"
          value={formatNumber(results.total_files_scanned)}
          color="text-brand-400"
        />
        <SummaryCard
          icon={Layers}
          label="Duplicate Groups"
          value={formatNumber(results.total_groups)}
          color="text-accent-violet"
        />
        <SummaryCard
          icon={FileWarning}
          label="Duplicates"
          value={formatNumber(results.total_duplicates)}
          color="text-accent-orange"
        />
        <SummaryCard
          icon={HardDrive}
          label="Total Size"
          value={formatBytes(results.total_size)}
          color="text-accent-cyan"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Reclaimable"
          value={formatBytes(results.total_wasted_size)}
          color="text-accent-green"
          highlight
        />
      </div>

      {/* Visualizations */}
      <div className="card">
        <button
          onClick={() => setShowViz(!showViz)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-400" />
            Storage Analysis
          </h3>
          {showViz ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {showViz && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-xs text-gray-500 mb-2">
                    File Type Distribution
                  </h4>
                  <FileTypeChart
                    extensionCounts={extCounts}
                    extensionSizes={extSizes}
                  />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-2">
                    Storage Treemap
                  </h4>
                  <StorageTreemap extensionSizes={extSizes} height={250} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActions
        groups={filteredGroups}
        onDelete={() => setShowDeleteDialog(true)}
      />

      {/* Filter & Sort Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterExt ?? ""}
            onChange={(e) => setFilterExt(e.target.value || null)}
            className="input w-32 text-xs"
          >
            <option value="">All types</option>
            {extensionList.map((ext) => (
              <option key={ext} value={ext}>
                .{ext}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-500 mr-2">Sort by:</span>
          {(["wasted", "count", "size"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={clsx(
                "px-2 py-1 rounded text-xs transition-colors",
                sortBy === s
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {s === "wasted"
                ? "Reclaimable"
                : s === "count"
                  ? "Count"
                  : "Total Size"}
            </button>
          ))}
        </div>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="card text-center py-12">
            <Layers className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No duplicate groups found</p>
            <p className="text-xs text-gray-600 mt-1">
              All files in the scanned directories are unique
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <DuplicateGroupCard key={group.id} group={group} />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteConfirmDialog onClose={() => setShowDeleteDialog(false)} />
      )}
    </motion.div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  highlight = false,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx(
        "card",
        highlight && "border-accent-green/30 glow-border"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={clsx("h-4 w-4", color)} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div
        className={clsx(
          "text-xl font-bold",
          highlight ? "text-accent-green" : "text-white"
        )}
      >
        {value}
      </div>
    </div>
  );
}
