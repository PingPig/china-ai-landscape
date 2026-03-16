"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AIProject, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  projects: AIProject[];
  quarter: string;
  onSelect: (p: AIProject) => void;
  selectedId?: string;
}

export default function RankingPanel({ projects, quarter, onSelect, selectedId }: Props) {
  const [animatedHeats, setAnimatedHeats] = useState<Record<string, number>>({});
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const isHoveringRef = useRef(false);
  const prevQuarterRef = useRef(quarter);
  const listRef = useRef<HTMLDivElement>(null);

  // Animate heat values on quarter change
  useEffect(() => {
    if (prevQuarterRef.current === quarter && Object.keys(animatedHeats).length > 0) return;
    prevQuarterRef.current = quarter;

    const targets: Record<string, number> = {};
    projects.forEach((p) => { targets[p.id] = p.heatByQuarter[quarter] || 0; });

    const startValues = { ...animatedHeats };
    const start = Date.now();
    const duration = 800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const current: Record<string, number> = {};
      for (const id in targets) {
        const from = startValues[id] || 0;
        current[id] = Math.round(from + (targets[id] - from) * eased);
      }
      setAnimatedHeats(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [quarter, projects]);

  // Reset highlight and scroll to top on quarter change
  useEffect(() => {
    setHighlightIdx(-1);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [quarter]);

  // Auto-cycle highlight every 3s (visual only, no scroll — pause on hover or selection)
  useEffect(() => {
    if (selectedId) return;
    const id = setInterval(() => {
      if (isHoveringRef.current) return;
      setHighlightIdx((prev) => (prev + 1) % projects.length);
    }, 3000);
    return () => clearInterval(id);
  }, [projects.length, selectedId, quarter]);

  // Scroll selected into view when selected from bubble chart
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const idx = projects.findIndex(p => p.id === selectedId);
    if (idx >= 0) {
      const item = listRef.current.children[idx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedId, projects]);

  const handleMouseEnter = useCallback(() => { isHoveringRef.current = true; }, []);
  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    setHoverIdx(-1);
  }, []);

  const quarters = Object.keys(projects[0]?.heatByQuarter || {}).sort();
  const qIdx = quarters.indexOf(quarter);
  const prevQuarter = qIdx > 0 ? quarters[qIdx - 1] : null;
  const maxHeat = Math.max(...projects.map((p) => p.heatByQuarter[quarter] || 0), 1);

  return (
    <div className="flex-1 min-h-0 dash-panel flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "var(--accent-2)" }} />
          <span>实时排行</span>
        </div>
        <span className="text-[9px] font-normal" style={{ color: "var(--text-4)" }}>{quarter}</span>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {projects.map((project, index) => {
          const heat = animatedHeats[project.id] ?? (project.heatByQuarter[quarter] || 0);
          const prevHeat = prevQuarter ? (project.heatByQuarter[prevQuarter] || 0) : heat;
          const trend = heat - prevHeat;
          const barWidth = (heat / maxHeat) * 100;
          const isSelected = project.id === selectedId;
          const isHighlighted = !selectedId && index === highlightIdx;
          const isHovered = index === hoverIdx;

          return (
            <button
              key={project.id}
              onClick={() => onSelect(project)}
              onMouseEnter={() => setHoverIdx(index)}
              className="w-full text-left px-3 py-[7px] flex items-center gap-2 transition-all duration-200 ranking-item"
              style={{
                borderLeft: isSelected
                  ? `3px solid var(--accent-1)`
                  : isHighlighted
                  ? `3px solid ${CATEGORY_COLORS[project.category]}`
                  : "3px solid transparent",
                background: isSelected
                  ? "var(--bg-hover)"
                  : isHighlighted
                  ? "var(--bg-hover)"
                  : isHovered
                  ? "var(--bg-hover)"
                  : "transparent",
              }}
              title={`${project.name} · ${CATEGORY_LABELS[project.category]} · 热度 ${heat}`}
            >
              {/* Rank badge */}
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: index < 3
                    ? index === 0 ? "#f59e0b20" : index === 1 ? "#94a3b820" : "#cd7f3220"
                    : "transparent",
                  color: index < 3
                    ? index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : "#cd7f32"
                    : "var(--text-4)",
                }}
              >
                {index + 1}
              </span>

              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                style={{
                  backgroundColor: CATEGORY_COLORS[project.category],
                  transform: isHovered || isSelected ? "scale(1.3)" : "scale(1)",
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-[11px] truncate font-medium"
                    style={{
                      color: isSelected || isHighlighted ? "var(--accent-1)" : "var(--text-1)",
                    }}
                  >
                    {project.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <span
                      className="text-[11px] font-bold tabular-nums"
                      style={{ color: "var(--text-1)" }}
                    >
                      {heat}
                    </span>
                    {trend > 0 && <TrendingUp size={12} className="trend-up" />}
                    {trend < 0 && <TrendingDown size={12} className="trend-down" />}
                    {trend === 0 && <Minus size={10} className="trend-flat" />}
                  </div>
                </div>
                <div
                  className="h-[3px] rounded-full overflow-hidden"
                  style={{ background: "var(--bar-bg)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: CATEGORY_COLORS[project.category],
                      opacity: isSelected || isHighlighted || isHovered ? 1 : 0.7,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
