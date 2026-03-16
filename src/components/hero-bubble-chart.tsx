"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/lib/types";
import { getBubbleChartOption } from "@/lib/echarts-options";
import ProjectCard from "./project-card";
import { ScrollReveal, ScanLine } from "./animated-bg";

echarts.use([ScatterChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
}

function TypewriterText({ text, speed = 60 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="typewriter-cursor" />}
    </span>
  );
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref} className="stat-number">{count}</span>;
}

export default function HeroBubbleChart({ projects }: Props) {
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return Array.from(cats) as Category[];
  }, [projects]);

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const option = useMemo(
    () =>
      getBubbleChartOption(
        projects,
        activeCategories.length > 0 ? activeCategories : undefined
      ),
    [projects, activeCategories]
  );

  const onChartClick = useCallback(
    (params: { value?: [number, number, number, string] }) => {
      if (params.value) {
        const project = projects.find((p) => p.id === params.value![3]);
        if (project) setSelectedProject(project);
      }
    },
    [projects]
  );

  return (
    <section id="hero" className="section-screen flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">
      <ScanLine />

      {/* Hero text */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-block mb-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#00f0ff]/60 block mb-2">
            Interactive Visualization · 2023 → 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-white mb-4 leading-tight">
          <TypewriterText text="2026中国AI生态全景图" speed={80} />
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-light">
          气泡大小 = 搜索热度 · 纵轴 = 融资阶段 · 横轴 = 成立时间 ·{" "}
          <span className="text-[#00f0ff]">点击</span>探索
        </p>
      </div>

      {/* Stats strip */}
      <ScrollReveal className="mb-8">
        <div className="flex items-center gap-8 md:gap-12">
          {[
            { label: "AI项目", value: projects.length, suffix: "+" },
            { label: "赛道", value: categories.length },
            { label: "关键事件", value: 20, suffix: "+" },
            { label: "时间跨度", value: 3, suffix: "年" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                <AnimatedCounter target={stat.value} />
                <span className="text-[#00f0ff] text-lg">{stat.suffix}</span>
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Category filter chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-4xl relative z-10">
        {categories.map((cat) => {
          const isActive = activeCategories.length === 0 || activeCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-mono transition-all duration-300 border ${
                isActive
                  ? "border-transparent text-white scale-100"
                  : "border-white/5 text-slate-600 scale-95 opacity-40"
              }`}
              style={{
                backgroundColor: isActive ? CATEGORY_COLORS[cat] + "25" : "transparent",
                boxShadow: isActive ? `0 0 12px ${CATEGORY_COLORS[cat]}20` : "none",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
        {activeCategories.length > 0 && (
          <button
            onClick={() => setActiveCategories([])}
            className="text-xs px-3 py-1.5 rounded-full border border-[#ff00aa]/30 text-[#ff00aa] hover:bg-[#ff00aa]/10 font-mono transition-all"
          >
            ✕ 重置
          </button>
        )}
      </div>

      {/* Chart */}
      <ScrollReveal className="w-full max-w-6xl relative z-10">
        <div className="h-[500px] md:h-[600px] relative neon-card p-2">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            style={{ height: "100%", width: "100%" }}
            onEvents={{ click: onChartClick }}
            notMerge
          />

          {selectedProject && (
            <div className="absolute top-4 right-4 z-10">
              <ProjectCard
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
              />
            </div>
          )}
        </div>
      </ScrollReveal>

      <p className="text-slate-700 text-[10px] mt-4 font-mono relative z-10">
        DATA SOURCE: PUBLIC INFO · FOR REFERENCE ONLY
      </p>
    </section>
  );
}
