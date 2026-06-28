"use client";

import { Download } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  dietary?: string | null;
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
  const header = "Naam,Status,Kant,Dieetwens";
  const rows = guests.map(g =>
    `"${g.name}","${g.rsvpStatus}","${g.side}","${g.dietary ?? ""}"`
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

  return (
    <div className="ddp-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gastgegevens</h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {guests.length > 0 && (
            <button
              onClick={() => exportGuestsCsv(guests)}
              title="Exporteer als CSV"
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
          {isPlanner && (
            <a href={`/weddings/${weddingId}/guests`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>Alle gasten →</a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ padding: "0.75rem", background: "var(--color-blush-soft)", borderRadius: "0.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>{total}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Totaal gasten</div>
        </div>
        <div style={{ padding: "0.75rem", background: "var(--color-blush-soft)", borderRadius: "0.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>{confirmed.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Bevestigd</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{ padding: "0.625rem 0.875rem", background: "var(--accent)", borderRadius: "0.5rem", marginBottom: "0.75rem", fontSize: "0.8125rem", color: "var(--muted)" }}>
          <strong style={{ color: "var(--foreground)" }}>{confirmed.length} couverts</strong> bevestigd
          {withDietary.length > 0 && <> · <strong style={{ color: "var(--foreground)" }}>{withDietary.length}</strong> met dieetwens</>}
        </div>
      )}

      {Object.keys(dietaryMap).length > 0 && (
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>Dieetwensen & allergieën</div>
          <div style={{ display: "grid", gap: "0.375rem" }}>
            {Object.entries(dietaryMap)
              .sort((a, b) => b[1] - a[1])
              .map(([diet, count]) => (
                <div key={diet} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--foreground)", textTransform: "capitalize" }}>{diet}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "var(--primary)", color: "white", fontSize: "0.6875rem", fontWeight: 700 }}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen gasten voor deze bruiloft.</p>
      )}
    </div>
  );
}
