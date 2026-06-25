"use client";

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
}

export default function GuestDataPanel({ guests, weddingId, totalGuests }: Props) {
  const confirmed = guests.filter(g => g.rsvpStatus === "confirmed");
  const withDietary = guests.filter(g => g.dietary && g.dietary.trim());

  const dietaryMap: Record<string, number> = {};
  for (const g of withDietary) {
    const d = g.dietary!.trim();
    dietaryMap[d] = (dietaryMap[d] ?? 0) + 1;
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gastgegevens</h3>
        <a href={`/weddings/${weddingId}/gasten`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>Alle gasten →</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--charcoal)" }}>{totalGuests}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Totaal gasten</div>
        </div>
        <div style={{ padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--charcoal)" }}>{confirmed.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Bevestigd</div>
        </div>
      </div>

      {Object.keys(dietaryMap).length > 0 && (
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--charcoal)", marginBottom: "0.5rem" }}>Dieetwensen</div>
          <div style={{ display: "grid", gap: "0.375rem" }}>
            {Object.entries(dietaryMap).map(([diet, count]) => (
              <div key={diet} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--charcoal)" }}>{diet}</span>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
