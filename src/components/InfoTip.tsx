"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface Props {
  label: string;
  text: string;
}

// Klein, functioneel uitlegicoontje voor jargon (bv. "RSVP") — werkt zowel
// met hover (desktop) als met een tik (mobiel, geen hover-events), en sluit
// bij een klik/tik ergens anders. Geen decoratief icoon: het draagt hier
// zelf de enige uitleg van een term die anders onverklaard blijft.
export default function InfoTip({ label, text }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        aria-label={label}
        aria-expanded={open}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "var(--tap-target-min)", height: "var(--tap-target-min)",
          margin: "calc(var(--tap-target-min) / -2 + 8px)",
          background: "none", border: "none", cursor: "pointer", color: "var(--muted-light)",
        }}
      >
        <Info style={{ width: "14px", height: "14px" }} />
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: "var(--ink)", color: "var(--ink-text, #fff)", fontSize: "var(--text-sm)",
            padding: "0.5rem 0.75rem", borderRadius: "8px", whiteSpace: "normal", width: "max-content",
            maxWidth: "220px", textAlign: "left", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 30,
            lineHeight: 1.4, fontWeight: 400,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
