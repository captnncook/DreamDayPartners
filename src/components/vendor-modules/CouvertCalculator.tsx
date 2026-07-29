"use client";

import { Calculator } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  dietary?: string | null;
  rsvpStatus: string;
  side: string;
}

interface Props {
  guests: Guest[];
  intakeData: Record<string, unknown>;
}

export default function CouvertCalculator({ guests, intakeData }: Props) {
  const confirmed = guests.filter(g => g.rsvpStatus === "confirmed");
  const pending = guests.filter(g => g.rsvpStatus === "pending" || g.rsvpStatus === "invited");
  const total = guests.length;

  // Price per person from menu builder if available
  const menuSections = intakeData.menuSections as Array<{ courses: Array<{ pricePerPerson?: number }> }> | undefined;
  const prices: number[] = [];
  menuSections?.forEach(s => s.courses.forEach(c => { if (c.pricePerPerson != null) prices.push(c.pricePerPerson); }));
  const totalMenuPpp = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) : null;

  const dietaryMap: Record<string, number> = {};
  for (const g of confirmed) {
    if (g.dietary?.trim()) {
      const d = g.dietary.trim().toLowerCase();
      dietaryMap[d] = (dietaryMap[d] ?? 0) + 1;
    }
  }

  const euro = (n: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="ddp-card">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <h3 className="font-semibold text-sm">Couvert-calculator</h3>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Bevestigd", value: confirmed.length },
          { label: "In afwachting", value: pending.length },
          { label: "Totaal uitgenodigd", value: total },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>{value}</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {totalMenuPpp != null && confirmed.length > 0 && (
        <div style={{ padding: "0.75rem 0", marginBottom: "1rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "0.25rem" }}>Geschatte totaalprijs (op basis van menu)</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>{euro(totalMenuPpp * confirmed.length)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>{euro(totalMenuPpp)} p.p. × {confirmed.length} bevestigde gasten</div>
        </div>
      )}

      {Object.keys(dietaryMap).length > 0 && (
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>Dieetwensen (bevestigde gasten)</div>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {Object.entries(dietaryMap).sort((a, b) => b[1] - a[1]).map(([diet, count]) => (
              <div key={diet} className="dash-row" style={{ padding: "0.5rem 0" }}>
                <span style={{ color: "var(--foreground)", textTransform: "capitalize", flex: 1 }}>{diet}</span>
                <span style={{ fontWeight: 700, color: "var(--gold-deep)" }}>{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmed.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen bevestigde gasten. De calculator wordt automatisch bijgewerkt.</p>
      )}
    </div>
  );
}
