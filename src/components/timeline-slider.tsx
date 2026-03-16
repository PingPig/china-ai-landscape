"use client";

import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, TimelineEvent, QUARTERS } from "@/lib/types";
import { getBubbleChartOption } from "@/lib/echarts-options";
import { Zap } from "lucide-react";
import { ScrollReveal } from "./animated-bg";

echarts.use([ScatterChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
  events: TimelineEvent[];
}

export default function TimelineSlider({ projects, events }: Props) {
  const [quarterIndex, setQuarterIndex] = useState(QUARTERS.length - 1);
  const currentQuarter = QUARTERS[quarterIndex];

  const option = useMemo(
    () => getBubbleChartOption(projects, undefined, currentQuarter),
    [projects, currentQuarter]
  );

  const currentEvents = useMemo(
    () => events.filter((e) => e.quarter === currentQuarter),
    [events, currentQuarter]
  );

  const impactStyles = {
    high: { dot: "bg-red-500 shadow-[0_0_8px_#ef4444]", badge: "text-red-400 bg-red-400/10 border-red-400/20" },
    medium: { dot: "bg-yellow-500 shadow-[0_0_8px_#eab308]", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    low: { dot: "bg-slate-500", badge: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  };

  return (
    <section id="timeline" className="section-screen py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#aaff00]/60 block mb-2">
              Time Machine
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              时间轴推演
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              拖动滑块，看AI生态如何从萌芽到爆发 — 气泡大小随时间脉动
            </p>
          </div>
        </ScrollReveal>

        {/* Quarter display + slider */}
        <ScrollReveal>
          <div className="max-w-4xl mx-auto mb-8">
            <div className="text-center mb-4">
              <span className="inline-block font-mono text-3xl font-black text-white tracking-wider">
                {currentQuarter.replace("Q", " Q")}
                <span className="inline-block w-1.5 h-6 bg-[#00f0ff] ml-1 animate-pulse rounded-sm" />
              </span>
            </div>
            <div className="px-4">
              <input
                type="range"
                min={0}
                max={QUARTERS.length - 1}
                value={quarterIndex}
                onChange={(e) => setQuarterIndex(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                {QUARTERS.map((q, i) => (
                  <span
                    key={q}
                    className={`text-[9px] font-mono cursor-pointer transition-colors ${
                      i === quarterIndex ? "text-[#00f0ff]" : i % 4 === 0 ? "text-slate-600" : "text-transparent"
                    }`}
                    onClick={() => setQuarterIndex(i)}
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 neon-card p-2">
            <div className="h-[450px]">
              <ReactEChartsCore
                echarts={echarts}
                option={option}
                style={{ height: "100%", width: "100%" }}
                notMerge
              />
            </div>
          </div>

          {/* Events panel */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Zap size={12} className="text-[#aaff00]" />
              Events · {currentQuarter}
            </h3>
            {currentEvents.length > 0 ? (
              currentEvents.map((event, i) => (
                <div
                  key={i}
                  className="neon-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${impactStyles[event.impact].dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white leading-snug">{event.title}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 font-mono ${impactStyles[event.impact].badge}`}>
                          {event.impact === "high" ? "HIGH" : event.impact === "medium" ? "MID" : "LOW"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{event.description}</p>
                      <span className="text-[9px] text-slate-700 font-mono mt-1 block">{event.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="neon-card p-6 text-center">
                <span className="text-slate-600 text-xs font-mono">NO MAJOR EVENTS RECORDED</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
