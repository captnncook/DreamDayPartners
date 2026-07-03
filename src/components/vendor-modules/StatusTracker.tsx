"use client";

const STATUSES = [
  { key: "lead", label: "Lead" },
  { key: "booked", label: "Geboekt" },
  { key: "in_progress", label: "In uitvoering" },
  { key: "ready", label: "Klaar" },
  { key: "completed", label: "Afgerond" },
];

interface Props {
  weddingId: string;
  wvId: string;
  status: string;
  onUpdate: (patch: Record<string, unknown>) => void;
  isPlanner: boolean;
}

export default function StatusTracker({ status, onUpdate, isPlanner }: Props) {
  const currentIdx = STATUSES.findIndex((s) => s.key === status);

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {STATUSES.map((s, idx) => {
          const isActive = s.key === status;
          const isPast = idx < currentIdx;
          return (
            <button
              key={s.key}
              onClick={() => isPlanner && onUpdate({ status: s.key })}
              disabled={!isPlanner}
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 400,
                border: isActive ? "none" : "1px solid var(--border)",
                background: isActive ? "var(--primary)" : isPast ? "var(--blush-soft)" : "transparent",
                color: isActive ? "white" : isPast ? "var(--primary)" : "var(--muted)",
                cursor: isPlanner ? "pointer" : "default",
                transition: "background 140ms var(--ease-out), color 140ms var(--ease-out), border-color 140ms var(--ease-out)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
