"use client";

import { Cake } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  dietary?: string | null;
  rsvpStatus: string;
  side: string;
}

interface Props {
  guests: Guest[];
  totalGuests: number;
  intakeData: Record<string, unknown>;
}

const LAYERS: { tiers: number; label: string; min: number; max: number }[] = [
  { tiers: 2, label: "2 lagen", min: 20, max: 40 },
  { tiers: 3, label: "3 lagen", min: 40, max: 80 },
  { tiers: 4, label: "4 lagen", min: 80, max: 130 },
  { tiers: 5, label: "5 lagen", min: 130, max: 200 },
];

export default function PortieCalculator({ guests, totalGuests, intakeData }: Props) {
  const confirmed = guests.filter(g => g.rsvpStatus === "confirmed").length;
  const baseCount = confirmed > 0 ? confirmed : totalGuests;
  const extra = Number(intakeData.portiesExtra ?? 0);
  const needed = baseCount + extra;

  const withDietary = guests.filter(g => g.dietary && g.dietary.trim());
  const dietaryMap: Record<string, number> = {};
  for (const g of withDietary) {
    const d = g.dietary!.trim().toLowerCase();
    dietaryMap[d] = (dietaryMap[d] ?? 0) + 1;
  }

  const recommended = LAYERS.find(l => needed >= l.min && needed < l.max) ?? LAYERS[LAYERS.length - 1];

  return (
    <div className="ddp-card">
      <div className="flex items-center gap-2 mb-4">
        <Cake className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <h3 className="font-semibold text-sm">Portie & taartadvies</h3>
      </div>

      {baseCount === 0 ? (
        <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", fontStyle: "italic" }}>
          Nog geen gasten bevestigd. Portieadvies is beschikbaar zodra de gastenlijst gevuld is.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)" }}>
            <div style={{ padding: "0.625rem", background: "var(--color-blush-soft)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "var(--foreground)" }}>{baseCount}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{confirmed > 0 ? "Bevestigd" : "Totaal"}</div>
            </div>
            <div style={{ padding: "0.625rem", background: "var(--accent)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "var(--foreground)" }}>{extra || "–"}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Extra porties</div>
            </div>
            <div style={{ padding: "0.625rem", background: "var(--primary)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "white" }}>{needed}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.8)" }}>Totaal nodig</div>
            </div>
          </div>

          <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.2rem" }}>Aanbevolen taartgrootte</div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--foreground)" }}>{recommended.label}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)" }}>{recommended.min}–{recommended.max} porties</div>
            </div>
            <Cake className="w-8 h-8" style={{ color: "var(--primary)", opacity: 0.4 }} />
          </div>

          {Object.keys(dietaryMap).length > 0 && (
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>Dieetwensen & allergieën</div>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                {Object.entries(dietaryMap).sort((a, b) => b[1] - a[1]).map(([diet, count]) => (
                  <div key={diet} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-base)", background: "var(--accent)", borderRadius: "6px", padding: "0.375rem 0.625rem" }}>
                    <span style={{ textTransform: "capitalize", color: "var(--foreground)" }}>{diet}</span>
                    <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "var(--text-md)" }}>{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
