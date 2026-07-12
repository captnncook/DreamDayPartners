"use client";

import { useState } from "react";

type DeleteInfo = {
  wedding: { id: string; title: string; date: string; isPast: boolean } | null;
  openTasks: number;
  guests: number;
  draaiboekItems: number;
  setupPercent: number;
  partnerHasAccount: boolean;
  dreamTeam: { vendorId: string; name: string; category: string }[];
};

// Accountverwijdering voor het bruidspaar, met een rol-specifieke tussenstap:
// - bruiloft nog niet geweest → eerlijk tonen wat er verloren gaat;
// - bruiloft al geweest → afscheidscijfer + optionele reviews per leverancier.
export default function CoupleDeleteSection() {
  const [step, setStep] = useState<"idle" | "review" | "confirm" | "sent">("idle");
  const [info, setInfo] = useState<DeleteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [platformRating, setPlatformRating] = useState<number | null>(null);
  const [vendorRatings, setVendorRatings] = useState<Record<string, number>>({});

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couple/delete-info");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Er ging iets mis"); return; }
      setInfo(data);
      setStep(data.wedding?.isPast ? "review" : "confirm");
    } finally {
      setLoading(false);
    }
  }

  async function submitReviewsAndContinue() {
    if (!info) return;
    setLoading(true);
    setError("");
    try {
      if (platformRating) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: platformRating }),
        }).catch(() => {});
      }
      if (info.wedding) {
        for (const [vendorId, rating] of Object.entries(vendorRatings)) {
          await fetch(`/api/catalogus/${vendorId}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weddingId: info.wedding.id, rating }),
          }).catch(() => {});
        }
      }
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  }

  async function requestDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couple/delete-request", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Er ging iets mis"); return; }
      setStep("sent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--danger)" }}>Account verwijderen</h3>

      {error && <p className="text-xs mb-2" style={{ color: "var(--danger)" }}>{error}</p>}

      {step === "idle" && (
        <>
          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
            Je account en jullie bruiloftgegevens worden permanent verwijderd. Je ontvangt eerst een bevestigingsmail.
          </p>
          <button
            onClick={start}
            disabled={loading}
            className="text-xs font-semibold"
            style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
          >
            {loading ? "Laden…" : "Account verwijderen"}
          </button>
        </>
      )}

      {/* Bruiloft al geweest: afscheid + reviews */}
      {step === "review" && info && (
        <div className="space-y-4">
          <p className="text-sm">
            Jullie dream day is geweest. Voordat je gaat: hoe was DreamDay voor jullie?
          </p>
          <div>
            <p className="text-xs font-semibold mb-1.5">Geef DreamDay een cijfer</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPlatformRating(n)}
                  style={{
                    width: "40px", height: "40px", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 700,
                    border: platformRating === n ? "none" : "1px solid var(--border)",
                    background: platformRating === n ? "var(--gold)" : "white",
                    color: platformRating === n ? "var(--ink)" : "var(--foreground)",
                    cursor: "pointer",
                    transition: "background 140ms var(--ease-out), color 140ms var(--ease-out)",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {info.dreamTeam.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5">Geef jullie leveranciers een cijfer (optioneel, 1 t/m 5)</p>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {info.dreamTeam.map((v) => (
                  <div key={v.vendorId} className="dash-row" style={{ flexWrap: "wrap" }}>
                    <div className="flex-1 min-w-0" style={{ minWidth: "140px" }}>
                      <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{v.name}</div>
                      <div className="text-xs capitalize" style={{ color: "var(--muted)" }}>{v.category}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setVendorRatings((p) => ({ ...p, [v.vendorId]: n }))}
                          aria-label={`${n} van 5`}
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 700,
                            border: (vendorRatings[v.vendorId] ?? 0) >= n ? "none" : "1px solid var(--border)",
                            background: (vendorRatings[v.vendorId] ?? 0) >= n ? "var(--gold)" : "white",
                            color: (vendorRatings[v.vendorId] ?? 0) >= n ? "var(--ink)" : "var(--muted)",
                            cursor: "pointer",
                            transition: "background 140ms var(--ease-out), color 140ms var(--ease-out)",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button onClick={submitReviewsAndContinue} disabled={loading} className="ddp-btn-primary" style={{ fontSize: "0.8125rem" }}>
              {loading ? "Versturen…" : "Versturen en doorgaan"}
            </button>
            <button onClick={() => setStep("confirm")} className="ddp-btn-secondary" style={{ fontSize: "0.8125rem" }}>
              Overslaan
            </button>
            <button onClick={() => setStep("idle")} className="text-xs" style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Definitieve bevestiging */}
      {step === "confirm" && info && (
        <div style={{ borderLeft: "3px solid var(--danger)", background: "var(--danger-bg)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1rem 1.25rem" }}>
          {info.wedding && !info.wedding.isPast ? (
            <>
              <p className="text-sm font-semibold mb-2">
                Weet je het zeker? Jullie zijn al op {info.setupPercent}% van de voorbereiding.
              </p>
              <p className="text-sm mb-2">Hiermee verlies je definitief:</p>
              <ul className="text-sm space-y-1 mb-3" style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {info.openTasks > 0 && <li><strong>{info.openTasks}</strong> openstaande {info.openTasks === 1 ? "taak" : "taken"}</li>}
                {info.draaiboekItems > 0 && <li><strong>{info.draaiboekItems}</strong> draaiboek-onderdel{info.draaiboekItems === 1 ? "en" : "en"} en afspraken</li>}
                {info.guests > 0 && <li>de gastenlijst met <strong>{info.guests}</strong> {info.guests === 1 ? "gast" : "gasten"} en hun RSVP's</li>}
                {info.dreamTeam.length > 0 && <li>jullie dream team van <strong>{info.dreamTeam.length}</strong> leverancier{info.dreamTeam.length === 1 ? "" : "s"}</li>}
              </ul>
              {info.dreamTeam.length > 0 && !info.partnerHasAccount && (
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  Jullie leveranciers krijgen automatisch bericht dat de bruiloft in DreamDay is geannuleerd.
                </p>
              )}
              {info.partnerHasAccount && (
                <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  Je partner heeft ook een account: de bruiloft blijft voor je partner bestaan, alleen jouw account verdwijnt.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm mb-3">
              Je account en de bijbehorende gegevens worden permanent verwijderd. Dit kan niet ongedaan worden gemaakt.
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button onClick={requestDelete} disabled={loading} className="ddp-btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)", fontSize: "0.8125rem" }}>
              {loading ? "Versturen…" : "Bevestig: stuur verwijdermail"}
            </button>
            <button onClick={() => setStep("idle")} className="ddp-btn-secondary" style={{ fontSize: "0.8125rem" }}>
              Annuleren
            </button>
          </div>
        </div>
      )}

      {step === "sent" && (
        <p className="text-xs mt-2 font-medium" style={{ color: "var(--danger)" }}>
          Bevestigingsmail verstuurd. Controleer je inbox en klik op de link om de verwijdering te voltooien.
        </p>
      )}
    </div>
  );
}
