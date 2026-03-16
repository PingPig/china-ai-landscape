"use client";

import { useEffect, useState } from "react";
import { AIProject } from "@/lib/types";
import { Activity, Flame, Trophy, Database, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface Props {
  quarter: string;
  projectCount: number;
  totalHeat: number;
  topProject: AIProject;
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

export default function TopBar({ quarter, projectCount, totalHeat, topProject }: Props) {
  const { theme, toggle, isDark } = useTheme();

  const stats = [
    { icon: <Database size={13} />, label: "项目数", value: String(projectCount) },
    { icon: <Flame size={13} />, label: "总热度", value: String(totalHeat) },
    { icon: <Trophy size={13} />, label: "最热", value: topProject?.name || "-" },
    { icon: <Activity size={13} />, label: "时段", value: quarter },
  ];

  return (
    <div
      className="relative z-10 h-11 flex items-center justify-between px-4 flex-shrink-0"
      style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-panel)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full live-dot" style={{ backgroundColor: "var(--accent-3)" }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
          中国AI生态
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-3)" }}>
          2026
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span style={{ color: "var(--text-3)" }}>{stat.icon}</span>
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{stat.label}</span>
            <span className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Right: theme toggle + clock */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: "var(--bg-hover)", color: "var(--text-2)" }}
          title={isDark ? "切换亮色" : "切换暗色"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "var(--accent-3)" }} />
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-3)" }}>
            <LiveClock />
          </span>
        </div>
      </div>
    </div>
  );
}
