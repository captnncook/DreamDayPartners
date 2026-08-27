"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/reportClientError";

// Vangt onverwachte React-renderfouten op elke pagina die geen eigen
// error.tsx heeft (bv. weddings/[id] heeft er wel een, zie die map).
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error, undefined, { digest: error.digest, boundary: "root" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="ddp-card text-center" style={{ padding: "2rem", maxWidth: "420px" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "var(--space-3)" }}>Er ging iets mis</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          {error.message || "Onbekende fout"}
        </p>
        {error.digest && (
          <p className="text-xs mb-4 font-mono" style={{ color: "var(--muted)", background: "rgba(0,0,0,0.04)", padding: "0.5rem", borderRadius: "8px" }}>
            {error.digest}
          </p>
        )}
        <button onClick={reset} className="ddp-btn-primary text-sm">Opnieuw proberen</button>
      </div>
    </div>
  );
}
