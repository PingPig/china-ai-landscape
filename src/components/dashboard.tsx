"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AIProject, TimelineEvent, MonitorData, QUARTERS, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/lib/types";
import TopBar from "./dashboard/top-bar";
import BubblePanel from "./dashboard/bubble-panel";
import RankingPanel from "./dashboard/ranking-panel";
import TimelineBar from "./dashboard/timeline-bar";
import LayerBreakdown from "./dashboard/layer-breakdown";
import EventFeed from "./dashboard/event-feed";
import CompactCompare from "./dashboard/compact-compare";
import AiChat from "./dashboard/ai-chat";
import TrendMini from "./dashboard/trend-mini";
import CategoryPie from "./dashboard/category-pie";
import NewsTicker from "./dashboard/news-ticker";
import MonitorPanel from "./dashboard/monitor-panel";

interface Props {
  projects: AIProject[];
  events: TimelineEvent[];
  monitorData: MonitorData;
}

export default function Dashboard({ projects, events, monitorData }: Props) {
  const [quarterIndex, setQuarterIndex] = useState(QUARTERS.length - 1);
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);
  const [activePanel, setActivePanel] = useState<"detail" | "compare" | "ai" | "monitor">("detail");
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const currentQuarter = QUARTERS[quarterIndex];

  const rankedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) => (b.heatByQuarter[currentQuarter] || 0) - (a.heatByQuarter[currentQuarter] || 0)
    );
  }, [projects, currentQuarter]);

  const currentEvents = useMemo(
    () => events.filter((e) => e.quarter === currentQuarter),
    [events, currentQuarter]
  );

  const totalHeat = useMemo(
    () => projects.reduce((sum, p) => sum + (p.heatByQuarter[currentQuarter] || 0), 0),
    [projects, currentQuarter]
  );

  // Auto-play timeline
  useEffect(() => {
    if (!isAutoPlay) return;
    const id = setInterval(() => {
      setQuarterIndex((prev) => (prev >= QUARTERS.length - 1 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(id);
  }, [isAutoPlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setQuarterIndex((p) => Math.max(0, p - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setQuarterIndex((p) => Math.min(QUARTERS.length - 1, p + 1));
          break;
        case " ":
          e.preventDefault();
          setIsAutoPlay((p) => !p);
          break;
        case "Escape":
          setSelectedProject(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const topProject = rankedProjects[0];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative" style={{ background: "var(--bg-primary)" }}>
      <div className="bg-grid" />

      <TopBar
        quarter={currentQuarter}
        projectCount={projects.length}
        totalHeat={totalHeat}
        topProject={topProject}
      />

      <NewsTicker events={events} />

      {/* Main 3-column */}
      <div className="flex-1 flex gap-1.5 p-1.5 pt-0 min-h-0 relative z-10">
        {/* Left: ranking + layers */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-1.5 min-h-0">
          <RankingPanel
            projects={rankedProjects}
            quarter={currentQuarter}
            onSelect={setSelectedProject}
            selectedId={selectedProject?.id}
          />
          <LayerBreakdown projects={projects} quarter={currentQuarter} />
        </div>

        {/* Center: chart + trend row + timeline */}
        <div className="flex-1 flex flex-col gap-1.5 min-h-0">
          <BubblePanel
            projects={projects}
            quarter={currentQuarter}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />

          {/* Stats row under chart */}
          <div className="h-[140px] flex-shrink-0 flex gap-1.5">
            <TrendMini projects={projects} quarter={currentQuarter} />
            <CategoryPie projects={projects} quarter={currentQuarter} />
            {/* Quick stats */}
            <div className="w-[200px] flex-shrink-0 dash-panel p-3 flex flex-col justify-between">
              <div className="panel-header !p-0 !border-0 !pb-1 mb-1">数据概览</div>
              {[
                { label: "总项目", value: String(projects.length), sub: "tracked" },
                { label: "平均热度", value: (totalHeat / projects.length).toFixed(0), sub: "avg/project" },
                { label: "最高热度", value: String(rankedProjects[0]?.heatByQuarter[currentQuarter] || 0), sub: rankedProjects[0]?.name || "" },
                { label: "赛道数", value: String(new Set(projects.map(p => p.category)).size), sub: "categories" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{s.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{s.value}</span>
                    <span className="text-[8px] ml-1" style={{ color: "var(--text-4)" }}>{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TimelineBar
            events={events}
            quarterIndex={quarterIndex}
            onQuarterChange={setQuarterIndex}
            currentQuarter={currentQuarter}
            isAutoPlay={isAutoPlay}
            onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
          />
        </div>

        {/* Right: events + switchable panel */}
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-1.5 min-h-0">
          <EventFeed events={currentEvents} quarter={currentQuarter} allEvents={events} />

          {/* Tab switcher */}
          <div className="flex gap-px flex-shrink-0" style={{ background: "var(--border)" }}>
            {([
              { key: "detail", label: "项目详情" },
              { key: "compare", label: "对比" },
              { key: "ai", label: "智能问答" },
              { key: "monitor", label: "监控" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                className="flex-1 text-[10px] py-1.5 transition-all"
                style={{
                  background: activePanel === tab.key ? "var(--bg-panel)" : "transparent",
                  color: activePanel === tab.key ? "var(--accent-1)" : "var(--text-3)",
                  fontWeight: activePanel === tab.key ? 600 : 400,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            {activePanel === "detail" && selectedProject && (
              <ProjectDetail project={selectedProject} quarter={currentQuarter} />
            )}
            {activePanel === "detail" && !selectedProject && (
              <div className="h-full dash-panel flex items-center justify-center">
                <span className="text-xs" style={{ color: "var(--text-4)" }}>点击左侧排行榜或中央气泡图</span>
              </div>
            )}
            {activePanel === "compare" && (
              <CompactCompare projects={projects} quarter={currentQuarter} />
            )}
            {activePanel === "ai" && <AiChat />}
            {activePanel === "monitor" && (
              <MonitorPanel
                monitorData={monitorData}
                selectedProjectId={selectedProject?.id}
                onSelectProject={(id) => {
                  const proj = projects.find((p) => p.id === id);
                  if (proj) {
                    setSelectedProject(proj);
                    setActivePanel("detail");
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hints */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 px-3 py-1 rounded-full"
        style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", opacity: 0.6 }}
      >
        <span className="flex items-center gap-1">
          <span className="kbd-hint">←→</span>
          <span className="text-[8px]" style={{ color: "var(--text-4)" }}>切换季度</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="kbd-hint">Space</span>
          <span className="text-[8px]" style={{ color: "var(--text-4)" }}>播放</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="kbd-hint">Esc</span>
          <span className="text-[8px]" style={{ color: "var(--text-4)" }}>取消</span>
        </span>
      </div>
    </div>
  );
}

function ProjectDetail({ project, quarter }: { project: AIProject; quarter: string }) {
  const heat = project.heatByQuarter[quarter] || 0;
  // Find all quarter heats for sparkline
  const quarters = Object.keys(project.heatByQuarter).sort();
  const heats = quarters.map(q => project.heatByQuarter[q] || 0);
  const maxH = Math.max(...heats, 1);

  return (
    <div className="h-full dash-panel p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[project.category] }}
        />
        <h3 className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{project.name}</h3>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-2" style={{
        backgroundColor: CATEGORY_COLORS[project.category] + "15",
        color: CATEGORY_COLORS[project.category],
      }}>
        {CATEGORY_LABELS[project.category]}
      </span>
      <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>{project.shortDesc}</p>

      {/* Mini sparkline */}
      <div className="mb-3">
        <span className="text-[9px] block mb-1" style={{ color: "var(--text-3)" }}>热度趋势</span>
        <div className="flex items-end gap-px h-8">
          {heats.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-300"
              style={{
                height: `${(h / maxH) * 100}%`,
                backgroundColor: quarters[i] === quarter
                  ? CATEGORY_COLORS[project.category]
                  : CATEGORY_COLORS[project.category] + "30",
                minHeight: 2,
              }}
              title={`${quarters[i]}: ${h}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[7px]" style={{ color: "var(--text-4)" }}>{quarters[0]}</span>
          <span className="text-[7px]" style={{ color: "var(--text-4)" }}>{quarters[quarters.length - 1]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {[
          { label: "当前热度", value: String(heat) },
          { label: "融资阶段", value: project.fundingRound },
          { label: "成立年份", value: `${project.founded}年` },
          { label: "产品数", value: String(project.products.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-2" style={{ background: "var(--bg-hover)" }}>
            <span className="text-[9px] block" style={{ color: "var(--text-3)" }}>{s.label}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <span className="text-[9px] block mb-1" style={{ color: "var(--text-3)" }}>产品</span>
        <div className="flex flex-wrap gap-1">
          {project.products.map((p) => (
            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-2)", border: `1px solid var(--border)` }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {project.tags.map((t) => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
            color: CATEGORY_COLORS[project.category],
            backgroundColor: CATEGORY_COLORS[project.category] + "10",
          }}>
            #{t}
          </span>
        ))}
      </div>

      {project.githubStars && (
        <div className="mt-2 rounded-lg p-2 flex items-center justify-between" style={{ background: "var(--bg-hover)" }}>
          <span className="text-[9px]" style={{ color: "var(--text-3)" }}>GitHub Stars</span>
          <span className="text-sm font-semibold" style={{ color: "var(--accent-3)" }}>
            {(project.githubStars / 1000).toFixed(0)}k
          </span>
        </div>
      )}
    </div>
  );
}
