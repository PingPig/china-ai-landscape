"use client";

import { useEffect, useRef, useState } from "react";
import { TimelineEvent } from "@/lib/types";

interface Props {
  events: TimelineEvent[];
}

export default function NewsTicker({ events }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    let pos = 0;
    let animId: number;

    const tick = () => {
      if (!pausedRef.current) {
        pos -= 0.4;
        if (Math.abs(pos) > inner.scrollWidth / 2) pos = 0;
        inner.style.transform = `translateX(${pos}px)`;
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [events]);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
    setIsPaused(false);
  };

  const items = [...events, ...events];

  const impactDot: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "var(--text-4)",
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-7 flex-shrink-0 overflow-hidden flex items-center relative"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-panel)",
        cursor: "default",
      }}
    >
      <div
        className="flex-shrink-0 px-2 flex items-center gap-1 z-10 h-full"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "#ef4444",
            animation: isPaused ? "none" : "live-pulse 2s ease-in-out infinite",
          }}
        />
        <span className="text-[9px] font-semibold" style={{ color: "var(--text-2)" }}>
          {isPaused ? "PAUSED" : "LIVE"}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={innerRef} className="flex items-center whitespace-nowrap will-change-transform">
          {items.map((event, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 mx-5 text-[10px] ticker-item"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: impactDot[event.impact] }}
              />
              <span style={{ color: "var(--text-3)" }}>{event.date.slice(0, 7)}</span>
              <span className="font-medium" style={{ color: "var(--text-1)" }}>
                {event.title}
              </span>
              <span style={{ color: "var(--text-4)" }}>|</span>
              <span
                className="max-w-[350px] truncate"
                style={{ color: "var(--text-3)" }}
              >
                {event.description}
              </span>
            </span>
          ))}
        </div>
      </div>

      {isPaused && (
        <div
          className="absolute right-2 text-[8px] px-1.5 py-0.5 rounded"
          style={{ background: "var(--bg-hover)", color: "var(--text-3)" }}
        >
          悬停暂停中
        </div>
      )}
    </div>
  );
}
