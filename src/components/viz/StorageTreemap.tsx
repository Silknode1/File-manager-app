import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { getFileCategory } from "../../types";
import { formatBytes } from "../../lib/format";

interface Props {
  extensionSizes: Record<string, number>;
  width?: number;
  height?: number;
}

interface TreeNode {
  name: string;
  value: number;
  color: string;
}

/**
 * D3 Treemap visualization showing storage usage by file extension.
 * Each rectangle's area is proportional to the total size of that extension.
 */
export function StorageTreemap({
  extensionSizes,
  width = 600,
  height = 300,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const treeData = useMemo(() => {
    return Object.entries(extensionSizes)
      .filter(([, size]) => size > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([ext, size]) => ({
        name: ext,
        value: size,
        color: getFileCategory(ext).color,
      }));
  }, [extensionSizes]);

  useEffect(() => {
    if (!svgRef.current || treeData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = d3
      .hierarchy({ children: treeData } as any)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<any>()
      .size([width, height])
      .paddingInner(2)
      .paddingOuter(2)
      .round(true)(root);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d: any) => d.data.color)
      .attr("opacity", 0.75)
      .attr("rx", 3)
      .style("cursor", "pointer")
      .on("mouseenter", function () {
        d3.select(this).transition().duration(150).attr("opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(150).attr("opacity", 0.75);
      });

    // Add labels for cells large enough
    nodes
      .filter((d: any) => d.x1 - d.x0 > 40 && d.y1 - d.y0 > 28)
      .append("text")
      .attr("x", 6)
      .attr("y", 16)
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text((d: any) => `.${d.data.name}`);

    nodes
      .filter((d: any) => d.x1 - d.x0 > 50 && d.y1 - d.y0 > 42)
      .append("text")
      .attr("x", 6)
      .attr("y", 30)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", "9px")
      .text((d: any) => formatBytes(d.data.value));
  }, [treeData, width, height]);

  if (treeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
        No data available
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full" style={{ height }} />;
}
