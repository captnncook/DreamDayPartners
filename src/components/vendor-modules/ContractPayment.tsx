"use client";
import { useState } from "react";

interface Props {
  weddingId: string;
  wvId: string;
  vendorName: string;
  depositAmount?: number | null;
  depositDue?: string | null;
  depositPaid: boolean;
  finalAmount?: number | null;
  finalDue?: string | null;
  finalPaid: boolean;
  contractUrl?: string | null;
  onUpdate: (patch: Record<string, unknown>) => void;
  isPlanner: boolean;
  isVendor: boolean;
  isCouple: boolean;
}

function fmt(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function fmtEur(v?: number | null) {
  if (v == null) return null;
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(v);
}

export default function ContractPayment({
  weddingId, wvId, vendorName, depositAmount, depositDue, depositPaid, finalAmount, finalDue, finalPaid, contractUrl, onUpdate,
  isPlanner, isVendor, isCouple,
}: Props) {
  // Bedrag/datum invullen mag door planner, leverancier zelf (weet wat ze
  // rekenen) én bruidspaar — niet alleen door de planner.
  const canEdit = isPlanner || isVendor || isCouple;
  const [editing, setEditing] = useState(false);
  const [creatingTaskFor, setCreatingTaskFor] = useState<string | null>(null);
  const [taskCreated, setTaskCreated] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    depositAmount: depositAmount ?? "",
    depositDue: depositDue ? depositDue.split("T")[0] : "",
    finalAmount: finalAmount ?? "",
    finalDue: finalDue ? finalDue.split("T")[0] : "",
    contractUrl: contractUrl ?? "",
  });

  function save() {
    onUpdate({
      depositAmount: form.depositAmount !== "" ? Number(form.depositAmount) : null,
      depositDue: form.depositDue || null,
      finalAmount: form.finalAmount !== "" ? Number(form.finalAmount) : null,
      finalDue: form.finalDue || null,
      contractUrl: form.contractUrl || null,
    });
    setEditing(false);
  }

  async function makeTask(label: string, due?: string | null) {
    setCreatingTaskFor(label);
    try {
      await fetch(`/api/weddings/${weddingId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${label} betalen aan ${vendorName}`,
          dueDate: due || null,
          category: "budget",
          priority: "medium",
          vendorBookingId: wvId,
        }),
      });
      setTaskCreated(prev => new Set(prev).add(label));
    } finally {
      setCreatingTaskFor(null);
    }
  }

  const inputStyle = {
    width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
    border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--charcoal)",
    boxSizing: "border-box" as const,
  };

  const rows = [
    { label: "Aanbetaling", amount: depositAmount, due: depositDue, paid: depositPaid, paidKey: "depositPaid" },
    { label: "Eindbetaling", amount: finalAmount, due: finalDue, paid: finalPaid, paidKey: "finalPaid" },
  ];

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Betaling</h3>
        {canEdit && (
          <button onClick={() => setEditing(!editing)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            {editing ? "Annuleren" : "Bewerken"}
          </button>
        )}
      </div>

      {contractUrl && (
        <a href={contractUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--primary)", marginBottom: "1rem" }}>
          Contract bekijken
        </a>
      )}

      {editing && canEdit ? (
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
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Contract/offerte/factuur-link</label>
            <input type="url" value={form.contractUrl} onChange={e => setForm(f => ({ ...f, contractUrl: e.target.value }))} style={inputStyle} placeholder="https://... (of upload het bestand hieronder bij Bestanden)" />
          </div>
          <button onClick={save} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
            Opslaan
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.625rem" }}>
          {rows.map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.625rem", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--charcoal)" }}>{row.label}</div>
                {(fmtEur(row.amount) || fmt(row.due)) ? (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.125rem" }}>
                    {[fmtEur(row.amount), fmt(row.due) ? `vervalt ${fmt(row.due)}` : null].filter(Boolean).join(" · ")}
                  </div>
                ) : canEdit && (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.125rem", fontStyle: "italic" }}>
                    Nog geen bedrag ingevuld
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {!row.paid && (
                  <button
                    onClick={() => makeTask(row.label, row.due)}
                    disabled={creatingTaskFor === row.label || taskCreated.has(row.label)}
                    style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {taskCreated.has(row.label) ? "Taak aangemaakt" : creatingTaskFor === row.label ? "Bezig…" : "Maak taak"}
                  </button>
                )}
                <button
                  onClick={() => onUpdate({ [row.paidKey]: !row.paid })}
                  style={{
                    padding: "0.375rem 0.875rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    background: row.paid ? "#22c55e20" : "rgba(0,0,0,0.06)",
                    color: row.paid ? "#16a34a" : "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {row.paid ? "Betaald" : "Nog niet betaald"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
