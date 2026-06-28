"use client";

import { useState } from "react";
import { UserCheck, Edit2, Check, X, Phone } from "lucide-react";

type ChauffeurData = {
  name: string;
  phone: string;
  backupName: string;
  backupPhone: string;
  notes: string;
};

const EMPTY: ChauffeurData = { name: "", phone: "", backupName: "", backupPhone: "", notes: "" };

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function ChauffeurInfo({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.chauffeurInfo as ChauffeurData | undefined;
  const [data, setData] = useState<ChauffeurData>(raw ?? EMPTY);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ChauffeurData>(raw ?? EMPTY);

  const hasData = data.name || data.phone;

  function saveData() {
    setData(form);
    onUpdate({ chauffeurInfo: form });
    setEditing(false);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" };

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <div>
            <h3 className="font-semibold text-sm">Chauffeursinformatie</h3>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>Aanspreekpunt op de trouwdag</p>
          </div>
        </div>
        {canEdit && !editing && (
          <button onClick={() => { setForm(data); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Chauffeur</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Naam chauffeur *" style={inputStyle} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefoonnummer *" type="tel" style={inputStyle} />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "0.5rem" }}>Vervanger bij ziekte</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.backupName} onChange={e => setForm(f => ({ ...f, backupName: e.target.value }))} placeholder="Naam (optioneel)" style={inputStyle} />
            <input value={form.backupPhone} onChange={e => setForm(f => ({ ...f, backupPhone: e.target.value }))} placeholder="Telefoonnummer" type="tel" style={inputStyle} />
          </div>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Extra info" style={inputStyle} />
          <div className="flex gap-2">
            <button onClick={saveData} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem" }}>
              <Check className="w-3.5 h-3.5" /> Opslaan
            </button>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : hasData ? (
        <div style={{ display: "grid", gap: "0.625rem" }}>
          <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>Chauffeur</div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{data.name}</div>
            {data.phone && (
              <a href={`tel:${data.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                <Phone className="w-3.5 h-3.5" /> {data.phone}
              </a>
            )}
          </div>
          {data.backupName && (
            <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>Vervanger bij ziekte</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{data.backupName}</div>
              {data.backupPhone && (
                <a href={`tel:${data.backupPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem", color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                  <Phone className="w-3.5 h-3.5" /> {data.backupPhone}
                </a>
              )}
            </div>
          )}
          {data.notes && <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: 0 }}>{data.notes}</p>}
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg de chauffeursinformatie toe voor de trouwdag." : "Nog geen chauffeursinformatie ingesteld."}
        </p>
      )}
    </div>
  );
}
