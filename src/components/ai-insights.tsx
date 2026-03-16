"use client";

import { useState, useRef } from "react";
import { Sparkles, Send, Loader2, Zap, TrendingUp, Cpu, Bot, Factory } from "lucide-react";
import { ScrollReveal } from "./animated-bg";

const STATIC_INSIGHTS = [
  {
    icon: <TrendingUp size={16} />,
    color: "#10b981",
    title: "开源模型崛起",
    content: "DeepSeek-R1以极低训练成本达到顶级推理能力，Qwen开源全系列，证明中国开源路线可行。",
  },
  {
    icon: <Zap size={16} />,
    color: "#f59e0b",
    title: "AI应用收割期",
    content: "豆包DAU破千万，可灵AI视频全球领先。从技术竞赛转向落地变现，平台公司占据先机。",
  },
  {
    icon: <Cpu size={16} />,
    color: "#f97316",
    title: "国产算力突破",
    content: "华为昇腾910B/C规模供货，缓解芯片制裁冲击。国产AI芯片生态渐成，但与NVIDIA仍有代际差距。",
  },
  {
    icon: <Bot size={16} />,
    color: "#8b5cf6",
    title: "AI Agent元年",
    content: "Manus引爆Agent赛道，自主完成复杂任务。Agent从概念走向产品化，重塑人机交互方式。",
  },
  {
    icon: <Factory size={16} />,
    color: "#d946ef",
    title: "具身智能爆发",
    content: "宇树机器人登上春晚，中国在人形/四足机器人硬件展现强大实力，AI+机器人加速融合。",
  },
];

export default function AiInsights() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("ai_query_count") || "0");
    }
    return 0;
  });
  const abortRef = useRef<AbortController | null>(null);

  const maxQueries = 5;

  const askAI = async () => {
    if (!question.trim() || queryCount >= maxQueries) return;

    setLoading(true);
    setAnswer("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setAnswer("抱歉，分析服务暂时不可用，请稍后再试。");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                setAnswer(result);
              }
            } catch {
              // skip
            }
          }
        }
      }

      const newCount = queryCount + 1;
      setQueryCount(newCount);
      localStorage.setItem("ai_query_count", String(newCount));
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAnswer("请求失败，请检查网络连接后重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="insights" className="section-screen py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#ff00aa]/60 block mb-2">
              AI-Powered Analysis
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              趋势洞察
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              五大核心趋势 + AI助手自由问答
            </p>
          </div>
        </ScrollReveal>

        {/* Insights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
          {STATIC_INSIGHTS.map((insight, i) => (
            <ScrollReveal key={i}>
              <div className="neon-card p-5 h-full group">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: insight.color + "15",
                      color: insight.color,
                      boxShadow: `0 0 0px ${insight.color}00`,
                    }}
                  >
                    {insight.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm">{insight.title}</h3>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">{insight.content}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* AI Q&A */}
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <div className="neon-card p-6 relative overflow-hidden">
              {/* Animated border glow */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(0,240,255,0.05), transparent 50%, rgba(255,0,170,0.05))",
                }}
              />

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#00f0ff]" />
                  AI问答
                </h3>
                <p className="text-[10px] text-slate-600 mb-5 font-mono">
                  FREE {maxQueries - queryCount}/{maxQueries} REMAINING · POWERED BY AI
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askAI()}
                    placeholder="DeepSeek和Qwen谁更有前景？中国AI芯片怎样？"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#00f0ff]/40 focus:shadow-[0_0_20px_rgba(0,240,255,0.05)] transition-all font-mono"
                    disabled={queryCount >= maxQueries}
                  />
                  <button
                    onClick={askAI}
                    disabled={loading || !question.trim() || queryCount >= maxQueries}
                    className="bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] hover:opacity-90 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-black font-bold px-5 py-3 rounded-xl text-sm transition-all flex items-center gap-1"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>

                {answer && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                    {answer}
                    {loading && <span className="streaming-cursor" />}
                  </div>
                )}

                {queryCount >= maxQueries && (
                  <p className="text-[10px] text-slate-700 text-center mt-3 font-mono">
                    QUOTA EXHAUSTED · THANKS FOR TRYING
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
