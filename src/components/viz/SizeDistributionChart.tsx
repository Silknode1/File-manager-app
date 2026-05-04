import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SizeDistribution } from "../../types";
import { formatNumber } from "../../lib/format";

interface Props {
  distribution: SizeDistribution;
}

const BUCKETS = [
  { key: "tiny", label: "< 1KB", color: "#15aabf" },
  { key: "small", label: "1K-100K", color: "#20c997" },
  { key: "medium", label: "100K-1M", color: "#40c057" },
  { key: "large", label: "1M-100M", color: "#fab005" },
  { key: "huge", label: "100M-1G", color: "#fd7e14" },
  { key: "massive", label: "> 1GB", color: "#fa5252" },
];

export function SizeDistributionChart({ distribution }: Props) {
  const data = BUCKETS.map((bucket) => ({
    ...bucket,
    count: distribution[bucket.key as keyof SizeDistribution],
  }));

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
        Waiting for data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatNumber(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#25262b",
            border: "1px solid #374151",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e5e7eb",
          }}
          formatter={(value: number) => [formatNumber(value), "Files"]}
          labelStyle={{ color: "#9ca3af" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
