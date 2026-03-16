"use client";

import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { RadarChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { AIProject, QUARTERS, CATEGORY_COLORS } from "@/lib/types";
import { getRadarChartOption, getTrendLineOption } from "@/lib/echarts-options";
import { ArrowLeftRight } from "lucide-react";
import { ScrollReveal } from "./animated-bg";

echarts.use([RadarChart, LineChart, TooltipComponent, LegendComponent, GridComponent, RadarComponent, CanvasRenderer]);

interface Props {
  projects: AIProject[];
}

export default function ComparePanel({ projects }: Props) {
  const [id1, setId1] = useState(projects[0]?.id || "");
  const [id2, setId2] = useState(projects[1]?.id || "");

  const p1 = projects.find((p) => p.id === id1);
  const p2 = projects.find((p) => p.id === id2);

  const radarOption = useMemo(() => {
    if (!p1 || !p2) return null;
    return getRadarChartOption(p1, p2, QUARTERS[QUARTERS.length - 1]);
  }, [p1, p2]);

  const trendOption = useMemo(() => {
    if (!p1 || !p2) return null;
    return getTrendLineOption(p1, p2);
  }, [p1, p2]);

  const swap = () => {
    setId1(id2);
    setId2(id1);
  };

  return (
    <section id="compare" className="section-screen py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#00f0ff]/60 block mb-2">
              Head to Head
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              项目对比器
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              选择两个AI项目，多维度PK
            </p>
          </div>
        </ScrollReveal>

        {/* Selectors */}
        <ScrollReveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="relative">
              <div className="absolute -top-5 left-0 text-[9px] font-mono text-[#00f0ff] tracking-widest">PLAYER 1</div>
              <select
                value={id1}
                onChange={(e) => setId1(e.target.value)}
                className="bg-white/[0.03] border border-[#00f0ff]/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00f0ff]/50 focus:shadow-[0_0_20px_rgba(0,240,255,0.1)] min-w-[180px] font-mono transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={swap}
              className="p-2.5 rounded-full border border-white/10 hover:border-[#ff00aa]/30 text-slate-500 hover:text-[#ff00aa] transition-all hover:shadow-[0_0_15px_rgba(255,0,170,0.15)] hover:rotate-180 duration-500"
            >
              <ArrowLeftRight size={16} />
            </button>

            <div className="relative">
              <div className="absolute -top-5 left-0 text-[9px] font-mono text-[#ff00aa] tracking-widest">PLAYER 2</div>
              <select
                value={id2}
                onChange={(e) => setId2(e.target.value)}
                className="bg-white/[0.03] border border-[#ff00aa]/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff00aa]/50 focus:shadow-[0_0_20px_rgba(255,0,170,0.1)] min-w-[180px] font-mono transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </ScrollReveal>

        {/* Charts */}
        {p1 && p2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ScrollReveal>
              <div className="neon-card p-6">
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                  Radar Comparison
                </h3>
                <div className="h-[350px]">
                  {radarOption && (
                    <ReactEChartsCore
                      echarts={echarts}
                      option={radarOption}
                      style={{ height: "100%", width: "100%" }}
                      notMerge
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="neon-card p-6">
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                  Trend Comparison
                </h3>
                <div className="h-[350px]">
                  {trendOption && (
                    <ReactEChartsCore
                      echarts={echarts}
                      option={trendOption}
                      style={{ height: "100%", width: "100%" }}
                      notMerge
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Stat cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { p: p1, color: "#00f0ff", label: "P1" },
                { p: p2, color: "#ff00aa", label: "P2" },
              ].map(({ p, color, label }) => (
                <ScrollReveal key={p.id}>
                  <div
                    className="neon-card p-5"
                    style={{ borderColor: color + "15" }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ color, backgroundColor: color + "15" }}
                      >
                        {label}
                      </span>
                      <h4 className="font-bold text-white">{p.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {[
                        { label: "融资阶段", value: p.fundingRound },
                        { label: "融资金额", value: p.funding },
                        { label: "产品数", value: String(p.products.length) },
                        {
                          label: "当前热度",
                          value: String(p.heatByQuarter[QUARTERS[QUARTERS.length - 1]] || 0),
                        },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <span className="text-slate-600 block text-[10px] font-mono uppercase tracking-wider">
                            {stat.label}
                          </span>
                          <span className="text-white font-mono">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
