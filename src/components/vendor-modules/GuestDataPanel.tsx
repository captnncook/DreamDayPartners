"use client";

import { Download } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  dietary?: string | null;
  allergies?: string | null;
  rsvpStatus: string;
  side: string;
}

interface Props {
  guests: Guest[];
  weddingId: string;
  totalGuests: number;
  isPlanner?: boolean;
}

function exportGuestsCsv(guests: Guest[]) {
  const header = "Naam,Status,Kant,Dieetwens,Allergie";
  const rows = guests.map(g =>
    `"${g.name}","${g.rsvpStatus}","${g.side}","${g.dietary ?? ""}","${g.allergies ?? ""}"`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "gastenlijst.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function GuestDataPanel({ guests, weddingId, isPlanner }: Props) {
  const total = guests.length;
  const confirmed = guests.filter(g => g.rsvpStatus === "confirmed");
  const withDietary = guests.filter(g => g.dietary && g.dietary.trim());

  const dietaryMap: Record<string, number> = {};
  for (const g of withDietary) {
    const d = g.dietary!.trim().toLowerCase();
    dietaryMap[d] = (dietaryMap[d] ?? 0) + 1;
  }

  // Allergieën apart van dieetvoorkeuren: dit is een gezondheidsrisico, geen
  // smaakvoorkeur, en moet per gast te herleiden blijven i.p.v. samengevoegd
  // te worden tot een anoniem totaal.
  const withAllergies = guests.filter(g => g.allergies && g.allergies.trim());

  return (
    <div className="ddp-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gastgegevens</h3>
        <div style={{ display: "flex", gap: "var(--space-5)", alignItems: "center" }}>
          {guests.length > 0 && (
            <button
              onClick={() => exportGuestsCsv(guests)}
              title="Exporteer als CSV"
              style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
          {isPlanner && (
            <a href={`/weddings/${weddingId}/guests`} style={{ fontSize: "var(--text-base)", color: "var(--primary)", textDecoration: "none" }}>Alle gasten →</a>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-8)", marginBottom: "var(--space-6)" }}>
        <div>
          <div style={{ fontSize: "var(--text-5xl)", fontWeight: 700, color: "var(--foreground)" }}>{total}</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)" }}>Totaal gasten</div>
        </div>
        <div>
          <div style={{ fontSize: "var(--text-5xl)", fontWeight: 700, color: "var(--foreground)" }}>{confirmed.length}</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)" }}>Bevestigd</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{ padding: "0.625rem 0", borderTop: "1px solid var(--border)", marginBottom: "var(--space-5)", fontSize: "var(--text-base)", color: "var(--muted)" }}>
          <strong style={{ color: "var(--foreground)" }}>{confirmed.length} couverts</strong> bevestigd
          {withDietary.length > 0 && <> · <strong style={{ color: "var(--foreground)" }}>{withDietary.length}</strong> met dieetwens</>}
        </div>
      )}

      {withAllergies.length > 0 && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--gold-deep)", marginBottom: "var(--space-3)" }}>
            Allergieën — let hierop bij het opdienen
          </div>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {withAllergies.map(g => (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", fontSize: "var(--text-md)", padding: "0.375rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{g.name}</span>
                <span style={{ color: "var(--gold-deep)", fontWeight: 700, textAlign: "right" }}>{g.allergies}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(dietaryMap).length > 0 && (
        <div>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-3)" }}>Dieetwensen (voorkeur)</div>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {Object.entries(dietaryMap)
              .sort((a, b) => b[1] - a[1])
              .map(([diet, count]) => (
                <div key={diet} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-md)" }}>
                  <span style={{ color: "var(--foreground)", textTransform: "capitalize" }}>{diet}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <p style={{ fontSize: "var(--text-md)", color: "var(--muted)", fontStyle: "italic" }}>Nog geen gasten voor deze bruiloft.</p>
      )}
    </div>
  );
}
