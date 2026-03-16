"use client";

import { useMemo, useCallback } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import { TooltipComponent, GridComponent, GraphicComponent, MarkLineComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import {
  AIProject,
  Category,
  Layer,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  LAYER_LABELS,
  LAYER_CATEGORIES,
} from "@/lib/types";
import { useTheme } from "@/lib/theme-context";

echarts.use([ScatterChart, TooltipComponent, GridComponent, GraphicComponent, MarkLineComponent, CanvasRenderer]);

// Layout config: each layer gets a Y band, categories spread along X within each layer
const LAYER_LAYOUT: { layer: Layer; yCenter: number; yHeight: number }[] = [
  { layer: "application", yCenter: 80, yHeight: 30 },
  { layer: "model", yCenter: 48, yHeight: 22 },
  { layer: "infrastructure", yCenter: 22, yHeight: 18 },
  { layer: "embodied", yCenter: 4, yHeight: 12 },
];

function getCategoryPositions() {
  const positions = new Map<Category, { x: number; y: number }>();
  for (const { layer, yCenter } of LAYER_LAYOUT) {
    const cats = LAYER_CATEGORIES[layer];
    const count = cats.length;
    const xSpacing = 85 / Math.max(count, 1);
    const xStart = 8 + xSpacing / 2;
    cats.forEach((cat, i) => {
      positions.set(cat, { x: xStart + i * xSpacing, y: yCenter });
    });
  }
  return positions;
}

// Deterministic spread for projects within a cluster using golden angle spiral
function spiralOffset(index: number, total: number, maxRadius: number) {
  if (total <= 1) return { dx: 0, dy: 0 };
  const goldenAngle = 2.399963; // ~137.5 degrees in radians
  const angle = index * goldenAngle;
  const r = Math.sqrt(index / total) * maxRadius;
  return { dx: Math.cos(angle) * r, dy: Math.sin(angle) * r };
}

interface Props {
  projects: AIProject[];
  quarter: string;
  selectedProject: AIProject | null;
  onSelectProject: (p: AIProject | null) => void;
}

export default function BubblePanel({ projects, quarter, selectedProject, onSelectProject }: Props) {
  const { isDark } = useTheme();

  const option = useMemo(() => {
    const catPositions = getCategoryPositions();

    // Group projects by category, sorted by heat descending (biggest bubble first)
    const catGroups = new Map<Category, AIProject[]>();
    for (const p of projects) {
      if (!catGroups.has(p.category)) catGroups.set(p.category, []);
      catGroups.get(p.category)!.push(p);
    }
    Array.from(catGroups.entries()).forEach(([, arr]) => {
      arr.sort((a, b) => (b.heatByQuarter[quarter] || 0) - (a.heatByQuarter[quarter] || 0));
    });

    // Build scatter data
    const data: unknown[] = [];
    Array.from(catGroups.entries()).forEach(([cat, arr]) => {
      const center = catPositions.get(cat);
      if (!center) return;

      const maxRadius = Math.min(8, 3 + arr.length * 0.8); // spread radius
      arr.forEach((p, idx) => {
        const heat = p.heatByQuarter[quarter] || 0;
        const { dx, dy } = spiralOffset(idx, arr.length, maxRadius);
        const isSelected = selectedProject?.id === p.id;
        const bubbleSize = Math.max(Math.sqrt(heat) * 5, 14);

        data.push({
          name: p.name,
          value: [center.x + dx, center.y + dy, heat, p.id, p.category],
          symbolSize: bubbleSize,
          itemStyle: {
            color: CATEGORY_COLORS[p.category],
            opacity: heat > 0 ? 0.9 : 0.55,
            ...(isSelected
              ? {
                  borderColor: isDark ? "#fff" : "#1e293b",
                  borderWidth: 3,
                  shadowBlur: 20,
                  shadowColor: CATEGORY_COLORS[p.category] + "80",
                  opacity: 1,
                }
              : {}),
          },
          label: {
            show: bubbleSize > 15,
            formatter: p.name,
            position: "inside" as const,
            fontSize: Math.min(Math.max(bubbleSize / 4, 7), 11),
            color: "#fff",
            textShadowBlur: 2,
            textShadowColor: "rgba(0,0,0,0.5)",
            overflow: "truncate" as const,
          },
        });
      });
    });

    const textColor = isDark ? "#475569" : "#94a3b8";
    const labelColor = isDark ? "#334155" : "#cbd5e1";
    const layerLineColor = isDark ? "rgba(51,65,85,0.3)" : "rgba(203,213,225,0.4)";

    // Layer zone labels + divider lines
    const graphicElements: unknown[] = [];

    for (const { layer, yCenter, yHeight } of LAYER_LAYOUT) {
      // Layer label on the left
      graphicElements.push({
        type: "text",
        left: 6,
        top: `${100 - yCenter - yHeight / 2 - 1}%`,
        style: {
          text: LAYER_LABELS[layer],
          fill: isDark ? "#475569" : "#94a3b8",
          fontSize: 11,
          fontWeight: 600,
        },
        silent: true,
      });
    }

    // Category labels at cluster centers
    Array.from(catPositions.entries()).forEach(([cat, pos]) => {
      // Placeholder - labels rendered via scatter series below
      void cat;
      void pos;
    });

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item" as const,
        className: "echarts-tooltip-custom",
        formatter: (params: { name: string; value: [number, number, number, string, string] }) => {
          const project = projects.find((p) => p.id === params.value[3]);
          if (!project) return params.name;
          const c = isDark ? "#e2e8f0" : "#1e293b";
          const c2 = isDark ? "#94a3b8" : "#64748b";
          const catColor = CATEGORY_COLORS[project.category];
          return `<div style="color:${c}">
            <div style="font-size:14px;font-weight:600;margin-bottom:3px">${project.name}</div>
            <div style="display:inline-block;font-size:9px;padding:1px 6px;border-radius:9px;background:${catColor}20;color:${catColor};margin-bottom:5px">${CATEGORY_LABELS[project.category]}</div>
            <div style="font-size:11px;color:${c2};margin-bottom:6px">${project.shortDesc}</div>
            <div style="font-size:11px">🔥 热度: <b>${params.value[2]}</b> · ${project.fundingRound}</div>
            <div style="font-size:10px;color:${c2};margin-top:3px">${project.tags.join(" · ")}</div>
          </div>`;
        },
      },
      graphic: graphicElements,
      grid: { left: 75, right: 15, top: 30, bottom: 15, containLabel: false },
      xAxis: {
        type: "value" as const,
        min: 0,
        max: 100,
        show: false,
      },
      yAxis: {
        type: "value" as const,
        min: -5,
        max: 100,
        show: false,
      },
      series: [
        // Category label markers (invisible scatter points with labels)
        {
          type: "scatter" as const,
          data: Array.from(catPositions.entries())
            .filter(([cat]) => catGroups.has(cat))
            .map(([cat, pos]) => ({
              name: CATEGORY_LABELS[cat],
              value: [pos.x, pos.y + 9],
              symbolSize: 0,
              label: {
                show: true,
                formatter: CATEGORY_LABELS[cat],
                fontSize: 9,
                color: labelColor,
                fontWeight: 500,
              },
            })),
          silent: true,
          animation: false,
          z: 1,
        },
        // Layer divider lines
        {
          type: "scatter" as const,
          data: [],
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: layerLineColor, type: "dashed" as const, width: 1 },
            data: [
              [{ coord: [0, 64] }, { coord: [100, 64] }],
              [{ coord: [0, 36] }, { coord: [100, 36] }],
              [{ coord: [0, 12] }, { coord: [100, 12] }],
            ],
            label: { show: false },
          },
          z: 0,
        },
        // Main bubbles
        {
          type: "scatter" as const,
          data,
          emphasis: {
            itemStyle: {
              opacity: 1,
              borderColor: isDark ? "#fff" : "#1e293b",
              borderWidth: 2,
            },
            scale: 1.15,
          },
          animationDuration: 600,
          animationEasingUpdate: "cubicOut" as const,
          z: 5,
        },
      ],
    };
  }, [projects, quarter, selectedProject, isDark]);

  const onChartClick = useCallback(
    (params: { value?: [number, number, number, string, string] }) => {
      if (params.value && params.value[3]) {
        const project = projects.find((p) => p.id === params.value![3]);
        if (project) onSelectProject(project);
      }
    },
    [projects, onSelectProject]
  );

  return (
    <div className="flex-1 min-h-0 dash-panel relative">
      <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 flex items-center justify-between pointer-events-none">
        <div className="panel-header !p-0 !border-0">生态全景图</div>
        <span className="text-[9px]" style={{ color: "var(--text-4)" }}>
          按赛道分区 · 气泡大小 = 热度 · 点击查看详情
        </span>
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: "100%", width: "100%" }}
        onEvents={{ click: onChartClick }}
        notMerge
      />
    </div>
  );
}
