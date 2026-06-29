"use client";

import { useLang } from "@/components/LangProvider";

export default function WeddingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { lang } = useLang();
  const isEn = lang === "en";

  return (
    <div className="px-4 py-12 max-w-xl mx-auto text-center">
      <div className="ddp-card" style={{ padding: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>!</div>
        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
          {isEn ? "Something went wrong" : "Er ging iets mis"}
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          {error.message || (isEn ? "Unknown error" : "Onbekende fout")}
        </p>
        {error.digest && (
          <p className="text-xs mb-4 font-mono" style={{ color: "var(--muted)", background: "rgba(0,0,0,0.04)", padding: "0.5rem", borderRadius: "8px" }}>
            {error.digest}
          </p>
        )}
        <button onClick={reset} className="ddp-btn-primary text-sm">
          {isEn ? "Try again" : "Opnieuw proberen"}
        </button>
      </div>
    </div>
  );
}
