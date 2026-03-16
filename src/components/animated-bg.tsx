"use client";

import { useEffect, useRef, useState } from "react";

export function CyberGrid() {
  return <div className="cyber-grid" />;
}

export function MouseSpotlight() {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <div className="mouse-spotlight" style={{ left: pos.x, top: pos.y }} />;
}

export function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 3 + 1;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;

      const colors = ["#00f0ff", "#ff00aa", "#aaff00", "#ffffff"];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.boxShadow = `0 0 ${size * 3}px ${p.style.background}`;

      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 15;
      p.style.animation = `float-up ${duration}s ${delay}s linear infinite`;

      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

export function AuroraBlobs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="aurora-blob-1" style={{ top: "-10%", left: "10%" }} />
      <div className="aurora-blob-2" style={{ top: "30%", right: "-5%" }} />
      <div className="aurora-blob-3" style={{ bottom: "10%", left: "40%" }} />
    </div>
  );
}

export function ScanLine() {
  return <div className="scanline" />;
}

export function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fade-in-up ${className}`}>
      {children}
    </div>
  );
}
