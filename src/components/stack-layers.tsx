"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIProject, Layer, LAYER_LABELS, LAYER_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS, Category } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollReveal } from "./animated-bg";

interface Props {
  projects: AIProject[];
}

const LAYER_ORDER: Layer[] = ["application", "model", "infrastructure", "embodied"];

const LAYER_ICONS: Record<Layer, string> = {
  application: "🚀",
  model: "🧠",
  infrastructure: "⚙️",
  embodied: "🤖",
};

const LAYER_ACCENT: Record<Layer, string> = {
  application: "#00f0ff",
  model: "#10b981",
  infrastructure: "#f97316",
  embodied: "#d946ef",
};

export default function StackLayers({ projects }: Props) {
  const [expandedLayer, setExpandedLayer] = useState<Layer | null>("application");

  const getProjectsByCategory = (cat: Category) =>
    projects.filter((p) => p.category === cat);

  return (
    <section id="layers" className="section-screen py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#ff00aa]/60 block mb-2">
              Industry Stack
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              赛道分层
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              四大层级架构：从底层算力芯片到顶层AI应用，点击展开探索
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {LAYER_ORDER.map((layer, layerIdx) => {
            const isExpanded = expandedLayer === layer;
            const categories = LAYER_CATEGORIES[layer];
            const projectCount = projects.filter((p) => p.layer === layer).length;
            const accent = LAYER_ACCENT[layer];

            return (
              <ScrollReveal key={layer}>
                <div
                  className={`neon-card overflow-hidden layer-${layer}`}
                  style={{
                    borderColor: isExpanded ? accent + "20" : undefined,
                    boxShadow: isExpanded ? `0 0 30px ${accent}08` : undefined,
                  }}
                >
                  <button
                    onClick={() => setExpandedLayer(isExpanded ? null : layer)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: accent + "15" }}
                      >
                        {LAYER_ICONS[layer]}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {LAYER_LABELS[layer]}
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{ color: accent, backgroundColor: accent + "15" }}
                          >
                            {projectCount}
                          </span>
                        </h3>
                        <span className="text-xs text-slate-600 font-mono">
                          {categories.map((c) => CATEGORY_LABELS[c]).join(" / ")}
                        </span>
                      </div>
                    </div>
                    <div
                      className="p-2 rounded-lg transition-all duration-300"
                      style={{
                        backgroundColor: isExpanded ? accent + "15" : "transparent",
                        color: isExpanded ? accent : "#475569",
                      }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div
                            className="h-px mb-5"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
                            }}
                          />
                          {categories.map((cat) => {
                            const catProjects = getProjectsByCategory(cat);
                            if (catProjects.length === 0) return null;

                            return (
                              <div key={cat} className="mb-5 last:mb-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: CATEGORY_COLORS[cat],
                                      boxShadow: `0 0 8px ${CATEGORY_COLORS[cat]}60`,
                                    }}
                                  />
                                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                                    {CATEGORY_LABELS[cat]}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {catProjects.map((p, i) => (
                                    <motion.div
                                      key={p.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="group bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-default"
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="font-semibold text-white text-sm group-hover:text-[#00f0ff] transition-colors">
                                          {p.name}
                                        </h4>
                                        <span className="text-[10px] font-mono text-slate-600">
                                          <span className="text-orange-400">●</span> {p.baiduIndex || 0}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mb-2.5 line-clamp-2 leading-relaxed">
                                        {p.shortDesc}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {p.tags.slice(0, 3).map((t) => (
                                          <span
                                            key={t}
                                            className="text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/5 text-slate-600"
                                          >
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
