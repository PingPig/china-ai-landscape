"use client";

import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { RadarChart } from "echarts/charts";
import { RadarComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, QUARTERS, FUNDING_ROUND_ORDER } from "@/lib/types";
import { ArrowLeftRight } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

echarts.use([RadarChart, RadarComponent, LegendComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
  quarter: string;
}

export default function CompactCompare({ projects, quarter }: Props) {
  const [id1, setId1] = useState(projects[0]?.id || "");
  const [id2, setId2] = useState(projects[1]?.id || "");
  const { isDark } = useTheme();

  const p1 = projects.find((p) => p.id === id1);
  const p2 = projects.find((p) => p.id === id2);

  const radarOption = useMemo(() => {
    if (!p1 || !p2) return null;
    const textColor = isDark ? "#64748b" : "#94a3b8";
    const lineColor = isDark ? "#1e293b" : "#e2e8f0";

    return {
      backgroundColor: "transparent",
      legend: {
        data: [p1.name, p2.name],
        bottom: 0,
        textStyle: { color: textColor, fontSize: 9 },
      },
      radar: {
        indicator: [
          { name: "热度", max: 100 },
          { name: "融资", max: 7 },
          { name: "产品", max: 10 },
          { name: "标签", max: 8 },
          { name: "开源", max: 5 },
        ],
        axisName: { color: textColor, fontSize: 9 },
        splitArea: { areaStyle: { color: isDark ? ["rgba(0,0,0,0)", "rgba(59,130,246,0.02)"] : ["rgba(0,0,0,0)", "rgba(59,130,246,0.03)"] } },
        axisLine: { lineStyle: { color: lineColor } },
        splitLine: { lineStyle: { color: lineColor } },
      },
      series: [{
        type: "radar" as const,
        data: [
          {
            value: [p1.heatByQuarter[quarter] || 0, FUNDING_ROUND_ORDER[p1.fundingRound] ?? 0, p1.products.length, p1.tags.length, p1.githubStars ? Math.min(Math.log10(p1.githubStars), 5) : 0],
            name: p1.name,
            areaStyle: { color: "rgba(59,130,246,0.15)" },
            lineStyle: { color: "#3b82f6" },
            itemStyle: { color: "#3b82f6" },
          },
          {
            value: [p2.heatByQuarter[quarter] || 0, FUNDING_ROUND_ORDER[p2.fundingRound] ?? 0, p2.products.length, p2.tags.length, p2.githubStars ? Math.min(Math.log10(p2.githubStars), 5) : 0],
            name: p2.name,
            areaStyle: { color: "rgba(239,68,68,0.15)" },
            lineStyle: { color: "#ef4444" },
            itemStyle: { color: "#ef4444" },
          },
        ],
      }],
    };
  }, [p1, p2, quarter, isDark]);

  return (
    <div className="h-full dash-panel flex flex-col">
      <div className="px-2 py-1.5 flex items-center gap-1 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <select
          value={id1}
          onChange={(e) => setId1(e.target.value)}
          className="flex-1 rounded-lg px-2 py-1 text-[10px] truncate focus:outline-none"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-1)" }}
        >
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <button
          onClick={() => { setId1(id2); setId2(id1); }}
          className="p-1 rounded transition-colors hover:rotate-180 duration-500"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeftRight size={11} />
        </button>
        <select
          value={id2}
          onChange={(e) => setId2(e.target.value)}
          className="flex-1 rounded-lg px-2 py-1 text-[10px] truncate focus:outline-none"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-1)" }}
        >
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </div>

      <div className="flex-1 min-h-0">
        {radarOption && (
          <ReactEChartsCore echarts={echarts} option={radarOption} style={{ height: "100%", width: "100%" }} notMerge />
        )}
      </div>

      {p1 && p2 && (
        <div className="grid grid-cols-2 gap-1 p-1.5 pt-0 flex-shrink-0">
          {[{ p: p1, c: "#3b82f6" }, { p: p2, c: "#ef4444" }].map(({ p, c }) => (
            <div key={p.id} className="rounded-lg p-1.5" style={{ background: "var(--bg-hover)" }}>
              <span className="text-[9px] block mb-0.5 truncate" style={{ color: c }}>{p.name}</span>
              <div className="text-[9px] space-y-0.5" style={{ color: "var(--text-3)" }}>
                <div className="flex justify-between">
                  <span>热度</span>
                  <span style={{ color: "var(--text-1)" }}>{p.heatByQuarter[quarter] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>融资</span>
                  <span style={{ color: "var(--text-1)" }}>{p.fundingRound}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
