"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, QUARTERS, CATEGORY_COLORS } from "@/lib/types";
import { useTheme } from "@/lib/theme-context";

echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
  quarter: string;
}

export default function TrendMini({ projects, quarter }: Props) {
  const { isDark } = useTheme();

  // Show top 5 projects by current heat
  const top5 = useMemo(() => {
    return [...projects]
      .sort((a, b) => (b.heatByQuarter[quarter] || 0) - (a.heatByQuarter[quarter] || 0))
      .slice(0, 5);
  }, [projects, quarter]);

  const option = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      className: "echarts-tooltip-custom",
      textStyle: { fontSize: 11 },
    },
    legend: {
      data: top5.map((p) => p.name),
      bottom: 0,
      textStyle: { color: isDark ? "#64748b" : "#94a3b8", fontSize: 9 },
      itemWidth: 10,
      itemHeight: 6,
    },
    grid: { left: 30, right: 10, top: 8, bottom: 35 },
    xAxis: {
      type: "category" as const,
      data: QUARTERS,
      axisLabel: { show: false },
      axisLine: { lineStyle: { color: isDark ? "#1e293b" : "#e2e8f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { show: false },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: isDark ? "#111827" : "#f1f5f9" } },
    },
    series: top5.map((p) => ({
      name: p.name,
      type: "line" as const,
      data: QUARTERS.map((q) => p.heatByQuarter[q] || 0),
      smooth: true,
      symbol: "none",
      lineStyle: { color: CATEGORY_COLORS[p.category], width: 1.5 },
      itemStyle: { color: CATEGORY_COLORS[p.category] },
    })),
  }), [top5, isDark]);

  return (
    <div className="flex-1 dash-panel flex flex-col min-w-0">
      <div className="panel-header">Top 5 热度趋势</div>
      <div className="flex-1 min-h-0">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: "100%", width: "100%" }}
          notMerge
        />
      </div>
    </div>
  );
}
