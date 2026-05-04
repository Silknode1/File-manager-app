import { motion } from "framer-motion";
import {
  StopCircle,
  Loader2,
  FileSearch,
  Filter,
  Hash,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  HardDrive,
  Activity,
} from "lucide-react";
import { useScanStore } from "../../store/scanStore";
import { formatBytes, formatNumber, formatDuration, formatRate } from "../../lib/format";
import { FileTypeChart } from "../viz/FileTypeChart";
import { SizeDistributionChart } from "../viz/SizeDistributionChart";
import { ExtensionBarChart } from "../viz/ExtensionBarChart";
import { AnimatedCounter } from "../common/AnimatedCounter";
import clsx from "clsx";

const phaseInfo: Record<
  string,
  { icon: typeof FileSearch; label: string; color: string }
> = {
  Idle: { icon: Clock, label: "Preparing...", color: "text-gray-400" },
  Discovery: {
    icon: FileSearch,
    label: "Discovering Files",
    color: "text-brand-400",
  },
  Filtering: {
    icon: Filter,
    label: "Applying Filters",
    color: "text-accent-teal",
  },
  Prehashing: {
    icon: Hash,
    label: "Pre-hashing (Head+Tail)",
    color: "text-accent-orange",
  },
  Hashing: {
    icon: Zap,
    label: "Full BLAKE3 Hashing",
    color: "text-accent-violet",
  },
  Grouping: {
    icon: Layers,
    label: "Grouping Duplicates",
    color: "text-accent-pink",
  },
  Complete: {
    icon: CheckCircle2,
    label: "Scan Complete",
    color: "text-accent-green",
  },
  Cancelled: {
    icon: AlertCircle,
    label: "Scan Cancelled",
    color: "text-accent-red",
  },
  Error: {
    icon: AlertCircle,
    label: "Scan Error",
    color: "text-accent-red",
  },
};

const phases = [
  "Discovery",
  "Filtering",
  "Prehashing",
  "Hashing",
  "Grouping",
  "Complete",
];

export function ScanProgress() {
  const { progress, cancelScan, isScanning } = useScanStore();
  const currentPhaseInfo = phaseInfo[progress.phase] || phaseInfo.Idle;
  const PhaseIcon = currentPhaseInfo.icon;

  const currentPhaseIndex = phases.indexOf(progress.phase);
  const overallProgress =
    progress.phase === "Complete"
      ? 100
      : Math.max(0, Math.min(95, (currentPhaseIndex / (phases.length - 1)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Phase Indicator */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isScanning ? 360 : 0 }}
              transition={{
                duration: 2,
                repeat: isScanning ? Infinity : 0,
                ease: "linear",
              }}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                progress.phase === "Complete"
                  ? "bg-accent-green/20"
                  : "bg-brand-600/20"
              )}
            >
              <PhaseIcon className={clsx("h-5 w-5", currentPhaseInfo.color)} />
            </motion.div>
            <div>
              <h3 className={clsx("text-base font-semibold", currentPhaseInfo.color)}>
                {currentPhaseInfo.label}
              </h3>
              <p className="text-xs text-gray-500 font-mono truncate max-w-md">
                {progress.current_path || "Initializing..."}
              </p>
            </div>
          </div>

          {isScanning && (
            <button onClick={cancelScan} className="btn-danger">
              <StopCircle className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        {/* Phase Pipeline */}
        <div className="flex items-center gap-1 mb-3">
          {phases.map((phase, idx) => (
            <div key={phase} className="flex items-center gap-1 flex-1">
              <div
                className={clsx(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  idx < currentPhaseIndex
                    ? "bg-accent-green"
                    : idx === currentPhaseIndex
                      ? "bg-brand-500 animate-pulse-gentle"
                      : "bg-dark-surface-3"
                )}
              />
            </div>
          ))}
        </div>

        {/* Overall Progress Bar */}
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {formatDuration(progress.elapsed_ms)} elapsed
          </span>
          {progress.estimated_remaining_ms && (
            <span>
              ~{formatDuration(progress.estimated_remaining_ms)} remaining
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FileSearch}
          label="Files Discovered"
          value={progress.total_files_discovered}
          color="text-brand-400"
          bgColor="bg-brand-600/20"
        />
        <StatCard
          icon={Filter}
          label="Files Filtered"
          value={progress.files_filtered}
          color="text-accent-orange"
          bgColor="bg-accent-orange/20"
        />
        <StatCard
          icon={Hash}
          label="Files Hashed"
          value={progress.files_hashed}
          color="text-accent-violet"
          bgColor="bg-accent-violet/20"
        />
        <StatCard
          icon={HardDrive}
          label="Data Processed"
          value={formatBytes(progress.bytes_processed)}
          isString
          color="text-accent-teal"
          bgColor="bg-accent-teal/20"
        />
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <Activity className="h-5 w-5 text-accent-green" />
          <div>
            <div className="text-lg font-bold text-white">
              {formatRate(progress.files_per_second)}
            </div>
            <div className="text-xs text-gray-500">Files/sec</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Zap className="h-5 w-5 text-accent-yellow" />
          <div>
            <div className="text-lg font-bold text-white">
              {formatBytes(progress.bytes_per_second)}/s
            </div>
            <div className="text-xs text-gray-500">Throughput</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-accent-cyan" />
          <div>
            <div className="text-lg font-bold text-white">
              {formatBytes(progress.total_bytes)}
            </div>
            <div className="text-xs text-gray-500">Total Size</div>
          </div>
        </div>
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Type Distribution (D3 donut chart) */}
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-3">
            File Type Distribution
          </h4>
          <FileTypeChart
            extensionCounts={progress.extension_counts}
            extensionSizes={progress.extension_sizes}
          />
        </div>

        {/* Size Distribution (Recharts bar chart) */}
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-3">
            Size Distribution
          </h4>
          <SizeDistributionChart distribution={progress.size_distribution} />
        </div>
      </div>

      {/* Extension Breakdown (Recharts horizontal bar) */}
      <div className="card">
        <h4 className="text-sm font-semibold text-white mb-3">
          Top Extensions by Count
        </h4>
        <ExtensionBarChart extensionCounts={progress.extension_counts} />
      </div>

      {/* Errors */}
      {progress.errors.length > 0 && (
        <div className="card border-accent-red/30">
          <h4 className="text-sm font-semibold text-accent-red mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Scan Errors ({progress.errors.length})
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {progress.errors.slice(0, 20).map((err, i) => (
              <p key={i} className="text-xs text-gray-400 font-mono">
                {err}
              </p>
            ))}
            {progress.errors.length > 20 && (
              <p className="text-xs text-gray-600">
                ...and {progress.errors.length - 20} more
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  isString = false,
}: {
  icon: typeof FileSearch;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  isString?: boolean;
}) {
  return (
    <motion.div
      className="card flex items-center gap-3"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div
        className={clsx(
          "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
          bgColor
        )}
      >
        <Icon className={clsx("h-4 w-4", color)} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold text-white truncate">
          {isString ? (
            value
          ) : (
            <AnimatedCounter value={value as number} />
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">{label}</div>
      </div>
    </motion.div>
  );
}
