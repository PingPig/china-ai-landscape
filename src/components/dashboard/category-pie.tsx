"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/lib/types";
import { useTheme } from "@/lib/theme-context";

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
  quarter: string;
}

export default function CategoryPie({ projects, quarter }: Props) {
  const { isDark } = useTheme();

  const option = useMemo(() => {
    const catMap = new Map<Category, number>();
    for (const p of projects) {
      const heat = p.heatByQuarter[quarter] || 0;
      catMap.set(p.category, (catMap.get(p.category) || 0) + heat);
    }

    const data = Array.from(catMap.entries())
      .map(([cat, heat]) => ({
        name: CATEGORY_LABELS[cat],
        value: heat,
        itemStyle: { color: CATEGORY_COLORS[cat] },
      }))
      .sort((a, b) => b.value - a.value);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item" as const,
        className: "echarts-tooltip-custom",
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}: ${p.value} (${p.percent}%)`,
      },
      series: [
        {
          type: "pie" as const,
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: isDark ? "#06080e" : "#f1f5f9", borderWidth: 2 },
          label: { show: false },
          data,
        },
      ],
    };
  }, [projects, quarter, isDark]);

  return (
    <div className="flex-1 dash-panel flex flex-col min-w-0">
      <div className="panel-header">赛道热度分布</div>
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
