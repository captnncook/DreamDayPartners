"use client";

interface Props {
  status: string;
  onUpdate: (patch: Record<string, unknown>) => void;
  isPlanner: boolean;
}

export default function ApprovalButton({ status, onUpdate, isPlanner }: Props) {
  if (!isPlanner) return null;
  if (status === "completed") {
    return (
      <div className="card" style={{ padding: "1.5rem", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          <div>
            <div style={{ fontWeight: 600, color: "#166534" }}>Afgerond & Goedgekeurd</div>
            <div style={{ fontSize: "0.875rem", color: "#16a34a" }}>Deze leverancier is succesvol afgerond.</div>
          </div>
          <button
            onClick={() => onUpdate({ status: "ready" })}
            style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            Ongedaan maken
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--charcoal)" }}>Afronden & Goedkeuren</div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Markeer deze leverancier als volledig afgerond.</div>
        </div>
        <button
          onClick={() => onUpdate({ status: "completed" })}
          style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
        >
          Goedkeuren
        </button>
      </div>
    </div>
  );
}
