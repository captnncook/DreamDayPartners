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

      {Object.keys(dietaryMap).length > 0 && (
        <div>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-3)" }}>Dieetwensen & allergieën</div>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {Object.entries(dietaryMap)
              .sort((a, b) => b[1] - a[1])
              .map(([diet, count]) => (
                <div key={diet} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-md)" }}>
                  <span style={{ color: "var(--foreground)", textTransform: "capitalize" }}>{diet}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: "var(--primary)", color: "white", fontSize: "var(--text-xs)", fontWeight: 700 }}>{count}</span>
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
