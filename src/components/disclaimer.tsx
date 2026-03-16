export default function Disclaimer() {
  return (
    <footer className="relative z-10 border-t border-white/5 py-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            Disclaimer
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff00aa] shadow-[0_0_6px_#ff00aa]" />
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed max-w-2xl mx-auto">
          本页面数据均来自公开信息整理（公司官网、新闻报道、公开融资信息等），仅供学习研究参考，不构成投资建议。
          搜索热度为相对值，不代表绝对数据。如有信息错误或侵权，请联系更正。
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-[10px] font-mono text-slate-700">
            © 2026 CN::AI::MAP
          </span>
          <span className="text-slate-800">·</span>
          <span className="text-[10px] font-mono text-slate-700">
            DATA CUT-OFF: 2026.Q1
          </span>
        </div>
      </div>
    </footer>
  );
}
