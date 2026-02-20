import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { getFileCategory, FILE_TYPE_CATEGORIES } from "../../types";
import { formatBytes, formatNumber } from "../../lib/format";

interface Props {
  extensionCounts: Record<string, number>;
  extensionSizes: Record<string, number>;
}

/**
 * Animated D3 donut chart showing file type distribution.
 * Groups extensions into categories (Images, Videos, Audio, etc.)
 * with smooth transitions as data updates in real-time.
 */
export function FileTypeChart({ extensionCounts, extensionSizes }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const categoryData = useMemo(() => {
    const cats: Record<string, { count: number; size: number }> = {};

    for (const [ext, count] of Object.entries(extensionCounts)) {
      const category = getFileCategory(ext);
      if (!cats[category.name]) {
        cats[category.name] = { count: 0, size: 0 };
      }
      cats[category.name].count += count;
      cats[category.name].size += extensionSizes[ext] || 0;
    }

    return FILE_TYPE_CATEGORIES.filter((cat) => cats[cat.name]?.count > 0).map(
      (cat) => ({
        name: cat.name,
        count: cats[cat.name]?.count || 0,
        size: cats[cat.name]?.size || 0,
        color: cat.color,
      })
    );
  }, [extensionCounts, extensionSizes]);

  const totalFiles = useMemo(
    () => categoryData.reduce((sum, d) => sum + d.count, 0),
    [categoryData]
  );

  const totalSize = useMemo(
    () => categoryData.reduce((sum, d) => sum + d.size, 0),
    [categoryData]
  );

  useEffect(() => {
    if (!svgRef.current || categoryData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Clear previous render
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<(typeof categoryData)[0]>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.02);

    const arc = d3
      .arc<d3.PieArcDatum<(typeof categoryData)[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 4)
      .cornerRadius(4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<(typeof categoryData)[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    const arcs = g
      .selectAll("path")
      .data(pie(categoryData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("opacity", 0.85)
      .attr("stroke", "#1a1b1e")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc)
          .attr("opacity", 1);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
          .attr("opacity", 0.85);
      });

    // Animate entry
    arcs
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(
          { startAngle: d.startAngle, endAngle: d.startAngle },
          d
        );
        return (t) => arc(interpolate(t)) || "";
      });

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .attr("fill", "#fff")
      .attr("font-size", "24px")
      .attr("font-weight", "700")
      .text(formatNumber(totalFiles));

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px")
      .text("total files");
  }, [categoryData, totalFiles]);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
        Waiting for data...
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <svg ref={svgRef} className="w-48 h-48 flex-shrink-0" />
      <div className="flex-1 space-y-1.5 pt-2">
        {categoryData.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-gray-300 flex-1">{cat.name}</span>
            <span className="text-gray-500 font-mono">
              {formatNumber(cat.count)}
            </span>
            <span className="text-gray-600 font-mono w-16 text-right">
              {formatBytes(cat.size)}
            </span>
          </div>
        ))}
        <div className="pt-1 border-t border-gray-800 flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="text-gray-400 font-medium flex-1">Total</span>
          <span className="text-gray-300 font-mono font-medium">
            {formatNumber(totalFiles)}
          </span>
          <span className="text-gray-400 font-mono w-16 text-right font-medium">
            {formatBytes(totalSize)}
          </span>
        </div>
      </div>
    </div>
  );
}
