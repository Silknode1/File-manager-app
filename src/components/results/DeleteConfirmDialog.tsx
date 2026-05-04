import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { moveToTrash, IS_TAURI } from "../../lib/tauri";
import { formatBytes, formatNumber } from "../../lib/format";

interface Props {
  onClose: () => void;
}

export function DeleteConfirmDialog({ onClose }: Props) {
  const { selectedFiles, results, clearSelection } = useScanStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{
    deleted: number;
    failed: number;
  } | null>(null);

  const filesToDelete = results
    ? results.duplicate_groups
        .flatMap((g) => g.files)
        .filter((f) => selectedFiles.has(f.id))
    : [];

  const totalSize = filesToDelete.reduce((sum, f) => sum + f.size, 0);

  const handleDelete = async () => {
    setIsDeleting(true);

    if (IS_TAURI) {
      try {
        const result = await moveToTrash(filesToDelete.map((f) => f.path));
        setDeleteResult({
          deleted: result.deleted_count,
          failed: result.failed_count,
        });
        if (result.deleted_count > 0) {
          clearSelection();
        }
      } catch (err) {
        setDeleteResult({ deleted: 0, failed: filesToDelete.length });
      }
    } else {
      // Demo mode
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDeleteResult({ deleted: filesToDelete.length, failed: 0 });
      clearSelection();
    }

    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md card border-gray-700"
      >
        {deleteResult ? (
          // Result view
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-accent-green mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Cleanup Complete
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              {formatNumber(deleteResult.deleted)} files moved to Trash
            </p>
            {deleteResult.failed > 0 && (
              <p className="text-sm text-accent-red">
                {formatNumber(deleteResult.failed)} files failed
              </p>
            )}
            <button onClick={onClose} className="btn-primary mt-4">
              Done
            </button>
          </div>
        ) : (
          // Confirmation view
          <>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-red/20 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-accent-red" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Move to Trash?
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  You're about to move{" "}
                  <span className="text-white font-medium">
                    {formatNumber(filesToDelete.length)} files
                  </span>{" "}
                  ({formatBytes(totalSize)}) to the Trash.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded hover:bg-dark-surface-2 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-dark-surface-2 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
              <div className="space-y-1">
                {filesToDelete.slice(0, 10).map((f) => (
                  <p
                    key={f.id}
                    className="text-xs text-gray-400 font-mono truncate"
                  >
                    {f.path}
                  </p>
                ))}
                {filesToDelete.length > 10 && (
                  <p className="text-xs text-gray-600">
                    ...and {filesToDelete.length - 10} more
                  </p>
                )}
              </div>
            </div>

            <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-accent-orange flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Files on network volumes (NAS/SMB) bypass the Trash and are
                permanently deleted.
              </p>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Moving to Trash...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Move {formatNumber(filesToDelete.length)} Files to Trash
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
