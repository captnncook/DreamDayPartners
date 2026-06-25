"use client";
import { useState } from "react";
import type { DeliverableConfig } from "@/lib/vendorTypeConfigs";

interface Deliverable {
  id: string;
  key: string;
  label: string;
  status: string;
  dueDate?: string | null;
  approvalRequired: boolean;
  notes?: string | null;
  fileUrl?: string | null;
}

interface Props {
  weddingId: string;
  wvId: string;
  deliverables: Deliverable[];
  configs: DeliverableConfig[];
  isPlanner: boolean;
  isVendor: boolean;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onAdd: (d: Omit<Deliverable, "id">) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "In afwachting",
  submitted: "Ingediend",
  approved: "Goedgekeurd",
  rejected: "Afgewezen",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--muted)",
  submitted: "var(--primary)",
  approved: "#22c55e",
  rejected: "#ef4444",
};

function fmt(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default function DeliverablesTracker({ weddingId, wvId, deliverables, configs, isPlanner, isVendor, onUpdate, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDue, setNewDue] = useState("");

  const inputStyle = {
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.875rem",
    background: "white",
  };

  function addDeliverable() {
    if (!newLabel.trim()) return;
    onAdd({ key: newLabel.toLowerCase().replace(/\s+/g, "_"), label: newLabel, status: "pending", dueDate: newDue || null, approvalRequired: false, notes: null, fileUrl: null });
    setNewLabel(""); setNewDue(""); setAdding(false);
  }

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deliverables</h3>
        {isPlanner && (
          <button onClick={() => setAdding(!adding)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            + Toevoegen
          </button>
        )}
      </div>

      {adding && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: "140px" }} />
          <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} style={{ ...inputStyle, width: "140px" }} />
          <button onClick={addDeliverable} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
            Toevoegen
          </button>
        </div>
      )}

      {deliverables.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen deliverables.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {deliverables.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--charcoal)" }}>{d.label}</div>
                {d.dueDate && <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Deadline: {fmt(d.dueDate)}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <select
                  value={d.status}
                  onChange={e => (isPlanner || isVendor) && onUpdate(d.id, { status: e.target.value })}
                  disabled={!isPlanner && !isVendor}
                  style={{ fontSize: "0.75rem", fontWeight: 600, color: STATUS_COLORS[d.status] ?? "var(--muted)", border: "none", background: "transparent", cursor: "pointer" }}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {isPlanner && (
                  <button onClick={() => onDelete(d.id)} style={{ fontSize: "1rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
