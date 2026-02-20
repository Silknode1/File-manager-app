import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  File,
  Image,
  Film,
  Music,
  FileText,
  Code,
  Archive,
  ExternalLink,
  Copy,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { formatBytes, truncatePath } from "../../lib/format";
import { getFileIconType } from "../../lib/format";
import type { DuplicateGroup, ScannedFile } from "../../types";
import clsx from "clsx";

const fileIcons = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
  code: Code,
  archive: Archive,
  file: File,
};

interface Props {
  group: DuplicateGroup;
}

export function DuplicateGroupCard({ group }: Props) {
  const { selectedFiles, toggleFileSelection, selectAll, deselectAll } =
    useScanStore();
  const [expanded, setExpanded] = useState(false);

  const selectedCount = group.files.filter((f) =>
    selectedFiles.has(f.id)
  ).length;
  const allSelected = selectedCount === group.files.length - 1; // Keep at least one
  const someSelected = selectedCount > 0;

  const iconType = getFileIconType(group.extension);
  const FileIcon = fileIcons[iconType];

  const handleToggleAll = () => {
    if (someSelected) {
      deselectAll(group.id);
    } else {
      selectAll(group.id);
    }
  };

  return (
    <motion.div
      layout
      className={clsx(
        "card overflow-hidden transition-colors",
        someSelected && "border-brand-500/30"
      )}
    >
      {/* Group Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleAll}
          className="flex-shrink-0 text-gray-400 hover:text-brand-400 transition-colors"
        >
          {someSelected ? (
            <CheckSquare className="h-5 w-5 text-brand-400" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>

        <div
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
            iconType === "image"
              ? "bg-brand-600/20"
              : iconType === "video"
                ? "bg-accent-violet/20"
                : iconType === "audio"
                  ? "bg-accent-pink/20"
                  : "bg-dark-surface-3"
          )}
        >
          <FileIcon className="h-4 w-4 text-gray-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {group.files[0].name}
            </span>
            <span className="badge-primary">.{group.extension}</span>
            <span className="badge bg-dark-surface-3 text-gray-400">
              {group.file_count} copies
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatBytes(group.files[0].size)} each
            </span>
            <span className="text-accent-green font-medium">
              {formatBytes(group.wasted_size)} reclaimable
            </span>
          </div>
        </div>

        {someSelected && (
          <span className="text-xs text-brand-400 font-medium">
            {selectedCount} selected
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-dark-surface-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded File List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1 border-t border-gray-800 pt-3">
              {group.files.map((file, idx) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isOriginal={idx === 0}
                  isSelected={selectedFiles.has(file.id)}
                  onToggle={() => toggleFileSelection(file.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FileRow({
  file,
  isOriginal,
  isSelected,
  onToggle,
}: {
  file: ScannedFile;
  isOriginal: boolean;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg px-2 py-2 group transition-colors",
        isSelected
          ? "bg-brand-600/10 border border-brand-500/20"
          : "hover:bg-dark-surface-2 border border-transparent"
      )}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 text-gray-400 hover:text-brand-400 transition-colors"
      >
        {isSelected ? (
          <CheckSquare className="h-4 w-4 text-brand-400" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "text-sm font-mono truncate",
              isSelected ? "text-gray-400 line-through" : "text-gray-200"
            )}
          >
            {truncatePath(file.path)}
          </span>
          {isOriginal && (
            <span className="badge-success text-[10px]">Original</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(file.modified).toLocaleDateString()}
          </span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigator.clipboard.writeText(file.path)}
          className="p-1 rounded hover:bg-dark-surface-3 text-gray-500 hover:text-gray-300"
          title="Copy path"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1 rounded hover:bg-dark-surface-3 text-gray-500 hover:text-gray-300"
          title="Reveal in Finder"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
