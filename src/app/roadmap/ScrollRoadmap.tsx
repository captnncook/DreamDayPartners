"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MILESTONES, type Status } from "./milestones";

function dotColor(status: Status) {
  return status === "upcoming" ? "rgba(255,255,255,0.25)" : "var(--gold)";
}

// Horizontale positie van de tijdlijn: dicht bij de linkerrand, kaarten
// schuiven daar rechts van in.
const LINE_LEFT = "clamp(1.25rem, 6vw, 3.5rem)";
const CONTENT_PADDING_LEFT = "clamp(2.75rem, 13vw, 7rem)";

export default function ScrollRoadmap() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const n = MILESTONES.length;
    const narrow = window.innerWidth < 700;
    let raf = 0;

    function update() {
      raf = 0;
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 1));
      const progress = scrollable > 0 ? scrolled / scrollable : 0;
      const floatIndex = progress * (n - 1);

      if (fillRef.current) fillRef.current.style.height = `${progress * 100}%`;
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - progress * 12));
      if (counterRef.current) {
        const idx = Math.min(n - 1, Math.round(floatIndex));
        counterRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      }

      for (let i = 0; i < n; i++) {
        const delta = floatIndex - i;
        const clamped = Math.max(-1, Math.min(1, delta));
        const abs = Math.abs(clamped);
        const scale = 1 - abs * (narrow ? 0.22 : 0.35);
        const opacity = Math.max(0, 1 - abs * 1.15);
        // Nog te komen (clamped < 0) start onderin en komt omhoog; wat
        // voorbij is (clamped > 0) is al verder omhoog verdwenen — tekst
        // reist dus van onder naar boven naarmate je naar beneden scrolt.
        const translateY = `${-clamped * (narrow ? 42 : 55)}%`;
        const translateZ = -abs * (narrow ? 160 : 320);
        const rotateX = clamped * (narrow ? -14 : -22);
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = `translateY(${translateY}) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.pointerEvents = abs < 0.5 ? "auto" : "none";
          card.style.zIndex = String(100 - Math.round(abs * 10));
        }
        const num = numberRefs.current[i];
        if (num) num.style.opacity = String(0.08 + (1 - abs) * 0.12);

        const dot = dotRefs.current[i];
        if (dot) {
          const isReached = floatIndex >= i - 0.5;
          dot.style.background = isReached ? "var(--gold)" : "rgba(255,255,255,0.18)";
          dot.style.transform = Math.round(floatIndex) === i ? "scale(1.5)" : "scale(1)";
        }
      }
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, mounted]);

  if (reducedMotion) {
    return (
      <div style={{ background: "var(--ink)", borderRadius: "24px", padding: "1rem" }}>
        <div style={{ borderLeft: "2px solid rgba(255,255,255,0.15)", marginLeft: "8px" }}>
          {MILESTONES.map((m, i) => (
            <div key={m.title} style={{ position: "relative", padding: "0 0 2rem 1.75rem" }}>
              <span style={{ position: "absolute", left: "-9px", top: "2px", width: 16, height: 16, borderRadius: "50%", background: dotColor(m.status), border: "2px solid var(--ink)" }} />
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: m.status === "upcoming" ? "rgba(255,255,255,0.4)" : "var(--gold)" }}>
                {String(i + 1).padStart(2, "0")} · {m.period}
              </span>
              <h3 className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "white", marginTop: "2px" }}>{m.title}</h3>
              <div className="flex flex-col sm:flex-row gap-3 mt-2 items-start">
                <div style={{ position: "relative", width: "100%", maxWidth: "220px", height: "140px", borderRadius: "14px", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={m.image} alt={m.imageAlt} fill style={{ objectFit: "cover" }} sizes="220px" />
                </div>
                <p style={{ fontSize: "var(--text-lg)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", height: `${MILESTONES.length * 100}vh` }}>
      <div
        style={{
          position: "sticky", top: 0, height: "100vh", overflow: "hidden",
          background: "radial-gradient(ellipse at 50% 30%, #223428 0%, var(--ink) 65%)",
        }}
      >
        {/* Tijdlijn aan de zijkant: baseline + gouden vulling volgens totale voortgang */}
        <div style={{ position: "absolute", left: LINE_LEFT, top: 0, bottom: 0, width: "2px", background: "rgba(255,255,255,0.10)" }} />
        <div ref={fillRef} style={{ position: "absolute", left: LINE_LEFT, top: 0, width: "2px", height: "0%", background: "linear-gradient(180deg, var(--gold), var(--gold-deep))", boxShadow: "0 0 16px rgba(201,167,93,0.6)" }} />

        {/* 3D stage */}
        <div style={{ position: "absolute", inset: 0, perspective: "1400px", perspectiveOrigin: "50% 50%" }}>
          {MILESTONES.map((m, i) => (
            <div
              key={m.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", willChange: "transform, opacity", transformStyle: "preserve-3d" }}
            >
              <div
                className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10"
                style={{ maxWidth: "980px", width: "100%", padding: `0 1.5rem 0 ${CONTENT_PADDING_LEFT}` }}
              >
                <div className="relative w-40 h-40 md:w-64 md:h-64 flex-shrink-0 rounded-2xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.45)" }}>
                  <Image src={m.image} alt={m.imageAlt} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 160px, 256px" priority={i === 0} />
                </div>
                <div className="text-center md:text-left">
                  <div
                    ref={(el) => { numberRefs.current[i] = el; }}
                    className="font-serif"
                    style={{ fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 700, color: "var(--gold)", lineHeight: 1, marginBottom: "var(--space-3)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: m.status === "upcoming" ? "rgba(255,255,255,0.45)" : "var(--gold)" }}>
                    {m.period}
                  </span>
                  <h3 className="font-serif" style={{ fontSize: "clamp(1.375rem, 3.4vw, 2rem)", fontWeight: 700, color: "white", marginTop: "var(--space-3)" }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-lg)", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginTop: "var(--space-5)", maxWidth: "440px" }}>
                    {m.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HUD: dots + counter */}
        <div style={{ position: "absolute", bottom: "clamp(1.25rem, 4vh, 2.5rem)", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "var(--space-4)" }}>
          {MILESTONES.map((_, i) => (
            <span
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.18)", transition: "background 200ms var(--ease-out), transform 200ms var(--ease-out)" }}
            />
          ))}
        </div>
        <div ref={counterRef} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", fontSize: "var(--text-sm)", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)" }}>
          01 / {String(MILESTONES.length).padStart(2, "0")}
        </div>
        <div ref={hintRef} style={{ position: "absolute", top: "1.5rem", left: LINE_LEFT, fontSize: "var(--text-sm)", fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", transition: "opacity 200ms var(--ease-out)" }}>
          Scroll om verder te gaan ↓
        </div>
      </div>
    </div>
  );
}
