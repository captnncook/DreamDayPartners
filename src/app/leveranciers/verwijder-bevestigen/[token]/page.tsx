"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function VerwijderBevestigenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Auto-confirm on page load after short delay to let user read
    // We don't auto-delete; user must click the button
  }, []);

  async function handleConfirm() {
    setStatus("loading");
    try {
      const res = await fetch("/api/vendor/delete-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Er ging iets mis");
        setStatus("error");
        return;
      }
      setStatus("done");
      // Redirect to home after 3 seconds
      setTimeout(() => router.push("/"), 3000);
    } catch {
      setErrorMsg("Verbindingsfout, probeer het opnieuw.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md ddp-card shadow-lg text-center space-y-5">
        {status === "done" ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--success)" }} />
            <h1 className="text-xl font-bold">Profiel verwijderd</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Je profiel en account zijn definitief verwijderd. Je wordt doorgestuurd naar de homepagina.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 mx-auto" style={{ color: "var(--danger)" }} />
            <h1 className="text-xl font-bold">Profiel definitief verwijderen?</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Dit verwijdert je profiel, je account en alle bijbehorende gegevens permanent. Deze actie kan niet ongedaan worden gemaakt.
            </p>

            {status === "error" && (
              <div className="text-sm p-3 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/leveranciers/mijn-profiel" className="ddp-btn-secondary flex-1">
                Annuleren
              </Link>
              <button
                onClick={handleConfirm}
                disabled={status === "loading"}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-opacity"
                style={{ background: "var(--danger)", opacity: status === "loading" ? 0.7 : 1, cursor: "pointer" }}
              >
                {status === "loading" ? "Verwijderen…" : "Ja, verwijder mijn profiel"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
