import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getFileCategory } from "../../types";
import { formatNumber } from "../../lib/format";

interface Props {
  extensionCounts: Record<string, number>;
  maxItems?: number;
}

export function ExtensionBarChart({ extensionCounts, maxItems = 12 }: Props) {
  const data = Object.entries(extensionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems)
    .map(([ext, count]) => ({
      extension: `.${ext}`,
      count,
      color: getFileCategory(ext).color,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
        Waiting for data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 45 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
          tickFormatter={(v) => formatNumber(v)}
        />
        <YAxis
          type="category"
          dataKey="extension"
          tick={{ fill: "#d1d5db", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
          axisLine={false}
          tickLine={false}
          width={40}
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
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} opacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
