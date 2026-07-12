"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

// Bevestigingspagina uit de verwijdermail voor bruidsparen.
export default function AccountVerwijderenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConfirm() {
    setStatus("loading");
    try {
      const res = await fetch("/api/couple/delete-confirm", {
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
            <h1 className="text-xl font-bold">Account verwijderd</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Je account en jullie bruiloftgegevens zijn definitief verwijderd. Gekoppelde leveranciers hebben bericht
              ontvangen. Je wordt doorgestuurd naar de homepagina.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 mx-auto" style={{ color: "var(--danger)" }} />
            <h1 className="text-xl font-bold">Account definitief verwijderen?</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Dit verwijdert je account en, als jij het laatste bruidspaar-lid bent, ook de bruiloft met alle taken,
              gasten en het draaiboek. Gekoppelde leveranciers krijgen bericht. Deze actie kan niet ongedaan worden
              gemaakt.
            </p>

            {status === "error" && (
              <div className="text-sm p-3 rounded-lg" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard" className="ddp-btn-secondary flex-1">
                Annuleren
              </Link>
              <button
                onClick={handleConfirm}
                disabled={status === "loading"}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white"
                style={{ background: "var(--danger)", opacity: status === "loading" ? 0.7 : 1, cursor: "pointer", border: "none", transition: "opacity 140ms var(--ease-out)" }}
              >
                {status === "loading" ? "Verwijderen…" : "Ja, verwijder mijn account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
