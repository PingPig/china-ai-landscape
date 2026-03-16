"use client";

import { QUARTERS } from "@/lib/types";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface Props {
  events: unknown[];
  quarterIndex: number;
  onQuarterChange: (i: number) => void;
  currentQuarter: string;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export default function TimelineBar({ quarterIndex, onQuarterChange, currentQuarter, isAutoPlay, onToggleAutoPlay }: Props) {
  return (
    <div className="h-14 flex-shrink-0 dash-panel flex items-center gap-3 px-3">
      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onQuarterChange(Math.max(0, quarterIndex - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 timeline-btn"
          style={{
            background: "var(--bg-hover)",
            color: "var(--text-3)",
          }}
          title="上一季度 (←)"
        >
          <SkipBack size={12} />
        </button>

        <button
          onClick={onToggleAutoPlay}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{
            background: isAutoPlay ? "var(--accent-1)" : "var(--bg-hover)",
            color: isAutoPlay ? "#fff" : "var(--text-2)",
            boxShadow: isAutoPlay ? "0 0 12px rgba(59,130,246,0.3)" : "none",
          }}
          title={isAutoPlay ? "暂停 (Space)" : "播放 (Space)"}
        >
          {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={() => onQuarterChange(Math.min(QUARTERS.length - 1, quarterIndex + 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 timeline-btn"
          style={{
            background: "var(--bg-hover)",
            color: "var(--text-3)",
          }}
          title="下一季度 (→)"
        >
          <SkipForward size={12} />
        </button>
      </div>

      {/* Quarter label */}
      <span
        className="text-lg font-bold tabular-nums w-20 text-center transition-all duration-300"
        style={{ color: "var(--text-1)" }}
      >
        {currentQuarter}
      </span>

      {/* Timeline dots */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* Progress track */}
        <div className="relative h-2 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-[3px] rounded-full" style={{ background: "var(--bar-bg)" }} />
          {/* Filled track */}
          <div
            className="absolute left-0 h-[3px] rounded-full transition-all duration-300"
            style={{
              width: `${(quarterIndex / (QUARTERS.length - 1)) * 100}%`,
              background: "var(--accent-1)",
              opacity: 0.6,
            }}
          />
          {/* Dots */}
          <div className="relative flex items-center justify-between w-full">
            {QUARTERS.map((q, i) => {
              const isActive = i === quarterIndex;
              const isPast = i < quarterIndex;
              const isYearStart = i % 4 === 0;
              return (
                <button
                  key={q}
                  onClick={() => onQuarterChange(i)}
                  className="relative flex items-center justify-center transition-all duration-200"
                  style={{
                    width: isActive ? 14 : isYearStart ? 8 : 6,
                    height: isActive ? 14 : isYearStart ? 8 : 6,
                    borderRadius: "50%",
                    background: isActive
                      ? "var(--accent-1)"
                      : isPast
                      ? "var(--accent-1)"
                      : "var(--text-4)",
                    opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
                    boxShadow: isActive ? "0 0 8px rgba(59,130,246,0.4)" : "none",
                    cursor: "pointer",
                    zIndex: isActive ? 2 : 1,
                  }}
                  title={q}
                />
              );
            })}
          </div>
        </div>

        {/* Quarter labels */}
        <div className="flex justify-between px-0">
          {QUARTERS.map((q, i) => {
            const isActive = i === quarterIndex;
            const isYearStart = i % 4 === 0;
            return (
              <span
                key={q}
                onClick={() => onQuarterChange(i)}
                className="cursor-pointer transition-all duration-200 text-center"
                style={{
                  fontSize: isActive ? 9 : 7,
                  fontWeight: isActive ? 700 : isYearStart ? 500 : 400,
                  color: isActive
                    ? "var(--accent-1)"
                    : isYearStart
                    ? "var(--text-3)"
                    : "var(--text-4)",
                  width: `${100 / QUARTERS.length}%`,
                }}
              >
                {isActive ? q : isYearStart ? q.slice(0, 4) : `Q${q.slice(-1)}`}
              </span>
            );
          })}
        </div>
      </div>

      {/* Quick jump */}
      <div className="flex gap-1 flex-shrink-0">
        {["2023Q1", "2024Q1", "2025Q1", "2026Q1"].map((q) => {
          const idx = QUARTERS.indexOf(q);
          if (idx < 0) return null;
          const isActive = currentQuarter.startsWith(q.slice(0, 4));
          return (
            <button
              key={q}
              onClick={() => onQuarterChange(idx)}
              className="text-[9px] px-2 py-1 rounded-md transition-all duration-200"
              style={{
                background: isActive ? "var(--accent-1)" : "var(--bg-hover)",
                color: isActive ? "#fff" : "var(--text-3)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {q.slice(0, 4)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
