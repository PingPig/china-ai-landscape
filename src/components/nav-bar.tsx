"use client";

import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "全景图" },
  { id: "layers", label: "赛道分层" },
  { id: "timeline", label: "时间轴" },
  { id: "compare", label: "对比" },
  { id: "insights", label: "AI分析" },
];

export default function NavBar() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#05060f]/90 backdrop-blur-xl border-b border-cyan-500/10 shadow-[0_0_30px_rgba(0,240,255,0.03)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <span className="text-base font-bold tracking-wide text-white glitch-text cursor-default">
            CN<span className="text-[#00f0ff]">::</span>AI
            <span className="text-[#ff00aa]">::</span>MAP
          </span>
          <span className="text-[10px] text-[#64748b] font-mono hidden sm:inline">v2026.Q1</span>
        </div>
        <div className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-300 ${
                active === item.id
                  ? "text-[#00f0ff] bg-[#00f0ff]/10 shadow-[inset_0_0_12px_rgba(0,240,255,0.1)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
