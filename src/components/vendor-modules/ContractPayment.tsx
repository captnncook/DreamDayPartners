"use client";
import { useState } from "react";

interface Props {
  weddingId: string;
  wvId: string;
  depositAmount?: number | null;
  depositDue?: string | null;
  depositPaid: boolean;
  finalAmount?: number | null;
  finalDue?: string | null;
  finalPaid: boolean;
  contractUrl?: string | null;
  onUpdate: (patch: Record<string, unknown>) => void;
  isPlanner: boolean;
}

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function fmtEur(v?: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(v);
}

export default function ContractPayment({ wvId, weddingId, depositAmount, depositDue, depositPaid, finalAmount, finalDue, finalPaid, contractUrl, onUpdate, isPlanner }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    depositAmount: depositAmount ?? "",
    depositDue: depositDue ? depositDue.split("T")[0] : "",
    finalAmount: finalAmount ?? "",
    finalDue: finalDue ? finalDue.split("T")[0] : "",
  });

  async function save() {
    onUpdate({
      depositAmount: form.depositAmount !== "" ? Number(form.depositAmount) : null,
      depositDue: form.depositDue || null,
      finalAmount: form.finalAmount !== "" ? Number(form.finalAmount) : null,
      finalDue: form.finalDue || null,
    });
    setEditing(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    fontSize: "0.875rem",
    background: "white",
    color: "var(--charcoal)",
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contract & Betaling</h3>
        {isPlanner && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      {contractUrl && (
        <a href={contractUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--primary)", marginBottom: "1rem" }}>
          📄 Contract bekijken
        </a>
      )}

      {editing ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Aanbetaling (€)</label>
              <input type="number" value={form.depositAmount} onChange={e => setForm(f => ({ ...f, depositAmount: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Vervaldatum aanbetaling</label>
              <input type="date" value={form.depositDue} onChange={e => setForm(f => ({ ...f, depositDue: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Eindbedrag (€)</label>
              <input type="number" value={form.finalAmount} onChange={e => setForm(f => ({ ...f, finalAmount: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Vervaldatum eindbetaling</label>
              <input type="date" value={form.finalDue} onChange={e => setForm(f => ({ ...f, finalDue: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <button onClick={save} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
            Opslaan
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {[
            { label: "Aanbetaling", amount: depositAmount, due: depositDue, paid: depositPaid, paidKey: "depositPaid" },
            { label: "Eindbetaling", amount: finalAmount, due: finalDue, paid: finalPaid, paidKey: "finalPaid" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--charcoal)" }}>{row.label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{fmtEur(row.amount)} · vervalt {fmt(row.due)}</div>
              </div>
              <button
                onClick={() => isPlanner && onUpdate({ [row.paidKey]: !row.paid })}
                disabled={!isPlanner}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "none",
                  background: row.paid ? "#22c55e" : "var(--border)",
                  color: row.paid ? "white" : "var(--muted)",
                  cursor: isPlanner ? "pointer" : "default",
                }}
              >
                {row.paid ? "✓ Betaald" : "Onbetaald"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
