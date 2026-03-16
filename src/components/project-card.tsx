"use client";

import { AIProject, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { ExternalLink, Star, X } from "lucide-react";

interface Props {
  project: AIProject;
  onClose?: () => void;
}

export default function ProjectCard({ project, onClose }: Props) {
  return (
    <div className="neon-card bg-[#05060f]/95 backdrop-blur-xl p-6 max-w-sm shadow-[0_0_40px_rgba(0,240,255,0.06)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">{project.name}</h3>
          <span
            className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: CATEGORY_COLORS[project.category] + "20",
              color: CATEGORY_COLORS[project.category],
              boxShadow: `0 0 8px ${CATEGORY_COLORS[project.category]}15`,
            }}
          >
            {CATEGORY_LABELS[project.category]}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-600 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{project.shortDesc}</p>

      <div className="space-y-2.5 text-sm">
        {[
          { label: "成立时间", value: `${project.founded}年` },
          { label: "融资", value: `${project.fundingRound} · ${project.funding}` },
          { label: "搜索热度", value: String(project.baiduIndex || "N/A") },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-slate-600 text-xs font-mono">{row.label}</span>
            <span className="text-slate-300 text-xs">{row.value}</span>
          </div>
        ))}
        {project.githubStars && (
          <div className="flex justify-between items-center">
            <span className="text-slate-600 text-xs font-mono flex items-center gap-1">
              <Star size={10} /> GitHub
            </span>
            <span className="text-[#aaff00] text-xs font-mono">
              {(project.githubStars / 1000).toFixed(0)}k
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <span className="text-slate-600 text-[10px] font-mono uppercase tracking-wider">Products</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {project.products.map((p) => (
            <span key={p} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/5">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-2 py-0.5 rounded-full border"
            style={{
              color: CATEGORY_COLORS[project.category],
              borderColor: CATEGORY_COLORS[project.category] + "30",
              backgroundColor: CATEGORY_COLORS[project.category] + "08",
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-1.5 text-xs text-[#00f0ff] hover:text-white transition-colors font-mono"
      >
        VISIT <ExternalLink size={12} />
      </a>
    </div>
  );
}
