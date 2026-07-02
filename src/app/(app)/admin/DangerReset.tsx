"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const CONFIRM_PHRASE = "VERWIJDER ALLES";

export default function DangerReset() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ vendorsDeleted: number; weddingsDeleted: number; usersDeleted: number } | null>(null);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/danger-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: typed }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Mislukt");
    } else {
      setResult(data);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
      <h2 className="dash-section-title mb-1" style={{ color: "var(--gold-deep)" }}>Alles wissen (tijdelijk)</h2>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        Verwijdert alle leveranciers, bruiloften en alle accounts behalve <strong>info@dreamdayplatform.com</strong>. Onomkeerbaar.
      </p>

      {!open && !result && (
        <button onClick={() => setOpen(true)} className="text-sm underline" style={{ color: "var(--gold-deep)" }}>
          Start verwijdering
        </button>
      )}

      {open && !result && (
        <div className="max-w-md">
          <div className="flex items-start gap-2 text-xs mb-3 p-2 rounded-lg" style={{ background: "var(--sand)", borderLeft: "3px solid var(--gold)" }}>
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--gold-deep)" }} />
            <span>Typ <strong>{CONFIRM_PHRASE}</strong> om te bevestigen. Dit kan niet ongedaan gemaakt worden.</span>
          </div>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="ddp-input mb-3"
            placeholder={CONFIRM_PHRASE}
          />
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={busy || typed !== CONFIRM_PHRASE}
              className="ddp-btn-primary"
              style={{ opacity: busy || typed !== CONFIRM_PHRASE ? 0.5 : 1 }}
            >
              {busy ? "Bezig…" : "Definitief verwijderen"}
            </button>
            <button onClick={() => { setOpen(false); setTyped(""); }} className="text-sm" style={{ color: "var(--muted)" }}>
              Annuleren
            </button>
          </div>
          {error && <p className="text-sm mt-2" style={{ color: "var(--danger)" }}>{error}</p>}
        </div>
      )}

      {result && (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Klaar: {result.vendorsDeleted} leveranciers, {result.weddingsDeleted} bruiloften en {result.usersDeleted} accounts verwijderd.
        </p>
      )}
    </div>
  );
}
