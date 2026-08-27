"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/reportClientError";

// Laatste redmiddel: vangt fouten die zelfs de root-layout laten crashen.
// Moet zijn eigen <html>/<body> renderen, want dit vervangt de hele boom.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error, undefined, { digest: error.digest, boundary: "global" });
  }, [error]);

  return (
    <html lang="nl">
      <body style={{ margin: 0, background: "#F5F3EE", color: "#1C2B24", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.75rem" }}>Er ging iets mis</h2>
            <p style={{ fontSize: "0.875rem", color: "#6E7580", marginBottom: "1rem" }}>{error.message || "Onbekende fout"}</p>
            <button
              onClick={reset}
              style={{ background: "#1C2B24", color: "white", border: "none", borderRadius: "999px", padding: "0.6rem 1.5rem", fontSize: "0.875rem", cursor: "pointer" }}
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
