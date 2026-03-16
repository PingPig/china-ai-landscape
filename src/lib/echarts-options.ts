import type { AIProject } from "./types";
import { CATEGORY_COLORS, CATEGORY_LABELS, FUNDING_ROUND_ORDER } from "./types";

export function getBubbleChartOption(
  projects: AIProject[],
  activeCategories?: string[],
  quarter?: string
) {
  const filtered = activeCategories
    ? projects.filter((p) => activeCategories.includes(p.category))
    : projects;

  const seriesMap = new Map<string, { name: string; color: string; data: unknown[] }>();

  for (const p of filtered) {
    if (!seriesMap.has(p.category)) {
      seriesMap.set(p.category, {
        name: CATEGORY_LABELS[p.category],
        color: CATEGORY_COLORS[p.category],
        data: [],
      });
    }

    const heat = quarter ? (p.heatByQuarter[quarter] || 0) : (p.baiduIndex || 30);
    const fundingY = FUNDING_ROUND_ORDER[p.fundingRound] ?? 3;

    seriesMap.get(p.category)!.data.push({
      name: p.name,
      value: [parseInt(p.founded), fundingY, heat, p.id],
      symbolSize: Math.max(heat * 0.8, 12),
    });
  }

  const series = Array.from(seriesMap.values()).map((s) => ({
    name: s.name,
    type: "scatter" as const,
    data: s.data,
    itemStyle: {
      color: s.color,
      opacity: 0.9,
      shadowBlur: 12,
      shadowColor: s.color + "40",
    },
    emphasis: {
      itemStyle: { opacity: 1, borderColor: "#00f0ff", borderWidth: 2, shadowBlur: 20, shadowColor: s.color + "80" },
      scale: 1.3,
    },
    label: {
      show: true,
      formatter: (params: { name: string }) => params.name,
      position: "top" as const,
      fontSize: 10,
      fontFamily: "monospace",
      color: "#94a3b8",
    },
  }));

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      className: "echarts-tooltip-custom",
      formatter: (params: { name: string; value: [number, number, number, string] }) => {
        const project = projects.find((p) => p.id === params.value[3]);
        if (!project) return params.name;
        return `
          <div style="color:#e2e8f0">
            <div style="font-size:16px;font-weight:600;margin-bottom:4px">${project.name}</div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">${project.shortDesc}</div>
            <div style="font-size:12px">🔥 热度: ${params.value[2]}</div>
            <div style="font-size:12px">💰 ${project.fundingRound} · ${project.funding}</div>
            <div style="font-size:12px">📦 ${project.products.join(", ")}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px">${project.tags.join(" · ")}</div>
          </div>
        `;
      },
    },
    legend: {
      type: "scroll" as const,
      bottom: 10,
      textStyle: { color: "#475569", fontSize: 11, fontFamily: "monospace" },
      pageTextStyle: { color: "#94a3b8" },
      itemWidth: 14,
      itemHeight: 14,
    },
    grid: {
      left: 80,
      right: 40,
      top: 40,
      bottom: 80,
    },
    xAxis: {
      type: "value" as const,
      name: "成立年份",
      nameTextStyle: { color: "#475569", fontSize: 11, fontFamily: "monospace" },
      min: 2015,
      max: 2025,
      axisLabel: {
        color: "#475569",
        fontSize: 10,
        fontFamily: "monospace",
        formatter: (v: number) => String(v),
      },
      axisLine: { lineStyle: { color: "#1a1a3a" } },
      splitLine: { lineStyle: { color: "#0f0f2a", type: "dashed" as const } },
    },
    yAxis: {
      type: "value" as const,
      name: "融资阶段",
      nameTextStyle: { color: "#475569", fontSize: 11, fontFamily: "monospace" },
      min: -0.5,
      max: 8,
      axisLabel: {
        color: "#475569",
        fontSize: 10,
        fontFamily: "monospace",
        formatter: (v: number) => {
          const labels: Record<number, string> = {
            0: "未融资",
            1: "天使/种子",
            2: "A轮",
            3: "B轮",
            4: "C轮",
            5: "D轮",
            6: "E轮+",
            7: "已上市",
          };
          return labels[v] || "";
        },
      },
      axisLine: { lineStyle: { color: "#1a1a3a" } },
      splitLine: { lineStyle: { color: "#0f0f2a", type: "dashed" as const } },
    },
    series,
  };
}

export function getRadarChartOption(p1: AIProject, p2: AIProject, quarter: string) {
  const heat1 = p1.heatByQuarter[quarter] || 0;
  const heat2 = p2.heatByQuarter[quarter] || 0;
  const funding1 = FUNDING_ROUND_ORDER[p1.fundingRound] ?? 0;
  const funding2 = FUNDING_ROUND_ORDER[p2.fundingRound] ?? 0;

  return {
    backgroundColor: "transparent",
    legend: {
      data: [p1.name, p2.name],
      bottom: 0,
      textStyle: { color: "#475569", fontFamily: "monospace" },
    },
    radar: {
      indicator: [
        { name: "搜索热度", max: 100 },
        { name: "融资阶段", max: 7 },
        { name: "产品数量", max: 10 },
        { name: "标签丰富度", max: 8 },
        { name: "GitHub Stars", max: 5 },
      ],
      axisName: { color: "#475569", fontSize: 11, fontFamily: "monospace" },
      splitArea: { areaStyle: { color: ["rgba(0,240,255,0.01)", "rgba(0,240,255,0.03)"] } },
      axisLine: { lineStyle: { color: "#1a1a3a" } },
      splitLine: { lineStyle: { color: "#0f0f2a" } },
    },
    series: [
      {
        type: "radar" as const,
        data: [
          {
            value: [
              heat1,
              funding1,
              p1.products.length,
              p1.tags.length,
              p1.githubStars ? Math.min(Math.log10(p1.githubStars), 5) : 0,
            ],
            name: p1.name,
            areaStyle: { color: "rgba(0,240,255,0.15)" },
            lineStyle: { color: "#00f0ff" },
            itemStyle: { color: "#00f0ff" },
          },
          {
            value: [
              heat2,
              funding2,
              p2.products.length,
              p2.tags.length,
              p2.githubStars ? Math.min(Math.log10(p2.githubStars), 5) : 0,
            ],
            name: p2.name,
            areaStyle: { color: "rgba(255,0,170,0.15)" },
            lineStyle: { color: "#ff00aa" },
            itemStyle: { color: "#ff00aa" },
          },
        ],
      },
    ],
  };
}

export function getTrendLineOption(p1: AIProject, p2: AIProject) {
  const quarters = Object.keys(p1.heatByQuarter).sort();

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      className: "echarts-tooltip-custom",
    },
    legend: {
      data: [p1.name, p2.name],
      bottom: 0,
      textStyle: { color: "#475569", fontFamily: "monospace" },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: "category" as const,
      data: quarters,
      axisLabel: { color: "#475569", fontSize: 9, fontFamily: "monospace", rotate: 45 },
      axisLine: { lineStyle: { color: "#1a1a3a" } },
    },
    yAxis: {
      type: "value" as const,
      name: "热度",
      nameTextStyle: { color: "#475569", fontFamily: "monospace" },
      axisLabel: { color: "#475569", fontFamily: "monospace" },
      axisLine: { lineStyle: { color: "#1a1a3a" } },
      splitLine: { lineStyle: { color: "#0f0f2a", type: "dashed" as const } },
    },
    series: [
      {
        name: p1.name,
        type: "line" as const,
        data: quarters.map((q) => p1.heatByQuarter[q] || 0),
        smooth: true,
        lineStyle: { color: "#00f0ff", width: 2 },
        itemStyle: { color: "#00f0ff" },
        areaStyle: { color: "rgba(0,240,255,0.08)" },
      },
      {
        name: p2.name,
        type: "line" as const,
        data: quarters.map((q) => p2.heatByQuarter[q] || 0),
        smooth: true,
        lineStyle: { color: "#ff00aa", width: 2 },
        itemStyle: { color: "#ff00aa" },
        areaStyle: { color: "rgba(255,0,170,0.08)" },
      },
    ],
  };
}
