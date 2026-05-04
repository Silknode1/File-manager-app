import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Wand2,
  XCircle,
  Clock,
  Route,
  ArrowDownUp,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { formatBytes, formatNumber } from "../../lib/format";
import type { DuplicateGroup } from "../../types";
import clsx from "clsx";

interface Props {
  groups: DuplicateGroup[];
  onDelete: () => void;
}

export function BulkActions({ groups, onDelete }: Props) {
  const { selectedFiles, applyBulkSelection, clearSelection, results } =
    useScanStore();

  const selectedCount = selectedFiles.size;

  // Calculate total size of selected files
  const selectedSize = results
    ? results.duplicate_groups
        .flatMap((g) => g.files)
        .filter((f) => selectedFiles.has(f.id))
        .reduce((sum, f) => sum + f.size, 0)
    : 0;

  const strategies = [
    {
      id: "keep-newest",
      icon: Clock,
      label: "Keep Newest",
      description: "Auto-select older duplicates",
    },
    {
      id: "keep-oldest",
      icon: ArrowDownUp,
      label: "Keep Oldest",
      description: "Auto-select newer duplicates",
    },
    {
      id: "keep-shortest-path",
      icon: Route,
      label: "Keep Shortest Path",
      description: "Keep files with shortest path",
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-accent-violet" />
            Bulk Actions
          </h3>

          {/* Strategy Buttons */}
          <div className="flex items-center gap-1">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => applyBulkSelection(strategy.id, groups)}
                className="btn-ghost text-xs py-1 px-2"
                title={strategy.description}
              >
                <strategy.icon className="h-3.5 w-3.5" />
                {strategy.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Info & Delete */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3"
            >
              <div className="text-xs text-gray-400">
                <span className="text-brand-400 font-semibold">
                  {formatNumber(selectedCount)}
                </span>{" "}
                files selected ({formatBytes(selectedSize)})
              </div>

              <button onClick={clearSelection} className="btn-ghost text-xs py-1">
                <XCircle className="h-3.5 w-3.5" />
                Clear
              </button>

              <button onClick={onDelete} className="btn-danger text-xs py-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Move to Trash
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
