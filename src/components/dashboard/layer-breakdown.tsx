"use client";

import { AIProject, Layer, LAYER_LABELS } from "@/lib/types";

interface Props {
  projects: AIProject[];
  quarter: string;
}

const LAYER_ORDER: Layer[] = ["application", "model", "infrastructure", "embodied"];
const LAYER_ACCENT: Record<Layer, string> = {
  application: "#3b82f6",
  model: "#10b981",
  infrastructure: "#f59e0b",
  embodied: "#a855f7",
};

export default function LayerBreakdown({ projects, quarter }: Props) {
  const totalHeat = Math.max(projects.reduce((s, p) => s + (p.heatByQuarter[quarter] || 0), 0), 1);

  return (
    <div className="h-[160px] flex-shrink-0 dash-panel flex flex-col">
      <div className="panel-header">层级分布</div>
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto">
        {LAYER_ORDER.map((layer) => {
          const layerProjects = projects.filter((p) => p.layer === layer);
          const layerHeat = layerProjects.reduce((s, p) => s + (p.heatByQuarter[quarter] || 0), 0);
          const pct = ((layerHeat / totalHeat) * 100).toFixed(0);

          return (
            <div key={layer}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: LAYER_ACCENT[layer] }} />
                  <span className="text-[10px]" style={{ color: "var(--text-2)" }}>{LAYER_LABELS[layer]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold" style={{ color: "var(--text-1)" }}>{layerProjects.length}</span>
                  <span className="text-[9px]" style={{ color: "var(--text-4)" }}>{pct}%</span>
                </div>
              </div>
              <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--bar-bg)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: LAYER_ACCENT[layer], opacity: 0.75 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
