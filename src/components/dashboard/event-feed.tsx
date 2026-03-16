"use client";

import { useMemo, useState } from "react";
import { TimelineEvent } from "@/lib/types";

interface Props {
  events: TimelineEvent[];
  quarter: string;
  allEvents: TimelineEvent[];
}

export default function EventFeed({ events, quarter, allEvents }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const displayEvents = useMemo(() => {
    if (events.length > 0) return { items: events, label: "当季事件" };
    const sorted = [...allEvents].sort((a, b) => {
      const distA = Math.abs(a.quarter.localeCompare(quarter));
      const distB = Math.abs(b.quarter.localeCompare(quarter));
      return distA - distB;
    });
    return { items: sorted.slice(0, 3), label: "近期事件" };
  }, [events, quarter, allEvents]);

  const impactColor: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "var(--text-3)",
  };

  const impactLabel: Record<string, string> = {
    high: "重大",
    medium: "重要",
    low: "一般",
  };

  return (
    <div className="h-[240px] flex-shrink-0 dash-panel flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "#f59e0b" }} />
          <span>{displayEvents.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{
            background: "var(--bg-hover)",
            color: "var(--text-3)",
          }}>
            {displayEvents.items.length}条
          </span>
          <span className="text-[9px] font-normal" style={{ color: "var(--text-4)" }}>{quarter}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {displayEvents.items.map((event, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <div
              key={i}
              className="flex gap-2.5 rounded-lg p-1.5 transition-all duration-200 cursor-pointer"
              style={{
                background: isExpanded ? "var(--bg-hover)" : "transparent",
              }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
              onMouseEnter={(e) => {
                if (!isExpanded) e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div
                  className="w-2.5 h-2.5 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: impactColor[event.impact],
                    transform: isExpanded ? "scale(1.3)" : "scale(1)",
                    boxShadow: isExpanded ? `0 0 6px ${impactColor[event.impact]}40` : "none",
                  }}
                />
                {i < displayEvents.items.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />
                )}
              </div>
              <div className="min-w-0 pb-1 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4
                    className="text-[11px] font-semibold leading-snug flex-1"
                    style={{ color: "var(--text-1)" }}
                  >
                    {event.title}
                  </h4>
                  <span
                    className="text-[7px] px-1 py-px rounded-full flex-shrink-0"
                    style={{
                      background: impactColor[event.impact] + "15",
                      color: impactColor[event.impact],
                    }}
                  >
                    {impactLabel[event.impact]}
                  </span>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-0.5"
                  style={{
                    color: "var(--text-3)",
                    display: isExpanded ? "block" : "-webkit-box",
                    WebkitLineClamp: isExpanded ? undefined : 2,
                    WebkitBoxOrient: isExpanded ? undefined : ("vertical" as const),
                    overflow: isExpanded ? "visible" : "hidden",
                  }}
                >
                  {event.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px]" style={{ color: "var(--text-4)" }}>{event.date}</span>
                  {event.relatedProjects.length > 0 && (
                    <span className="text-[8px]" style={{ color: "var(--text-4)" }}>
                      相关: {event.relatedProjects.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
