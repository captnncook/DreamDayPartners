"use client";

import { useState } from "react";
import { Car, Plus, Trash2, Edit2, Check, X, Navigation } from "lucide-react";

type Rit = {
  id: string;
  time: string;
  from: string;
  to: string;
  passengers: number | "";
  notes: string;
};

const EMPTY: Omit<Rit, "id"> = { time: "", from: "", to: "", passengers: "", notes: "" };

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function RittenPlanner({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.ritten as Rit[] | undefined;
  const [ritten, setRitten] = useState<Rit[]>(raw ?? []);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);

  function save(updated: Rit[]) {
    setRitten(updated);
    onUpdate({ ritten: updated });
  }

  function startAdd() { setEditingId("new"); setForm(EMPTY); }
  function startEdit(r: Rit) { setEditingId(r.id); setForm({ time: r.time, from: r.from, to: r.to, passengers: r.passengers, notes: r.notes }); }

  function saveRit() {
    if (!form.from || !form.to) return;
    const rit: Rit = { id: editingId === "new" ? `rit-${Date.now()}` : editingId!, ...form };
    const updated = editingId === "new"
      ? [...ritten, rit].sort((a, b) => a.time.localeCompare(b.time))
      : ritten.map(r => r.id === editingId ? rit : r);
    save(updated);
    setEditingId(null);
  }

  function mapsLink(from: string, to: string) {
    return `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" };

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <div>
            <h3 className="font-semibold text-sm">Rittenplanning</h3>
            {ritten.length > 0 && (
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>{ritten.length} rit{ritten.length !== 1 ? "ten" : ""} gepland</p>
            )}
          </div>
        </div>
        {canEdit && (
          <button onClick={startAdd} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Plus className="w-3.5 h-3.5" /> Rit toevoegen
          </button>
        )}
      </div>

      {editingId === "new" && (
        <RitForm form={form} setForm={setForm} onSave={saveRit} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
      )}

      {ritten.length === 0 && editingId !== "new" && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg alle ritten toe voor de trouwdag." : "Nog geen ritten gepland."}
        </p>
      )}

      <div className="space-y-2">
        {ritten.map((rit, idx) => (
          <div key={rit.id}>
            {editingId === rit.id ? (
              <RitForm form={form} setForm={setForm} onSave={saveRit} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
            ) : (
              <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div style={{ minWidth: "2.75rem", textAlign: "center", background: "var(--primary)", color: "white", borderRadius: "6px", padding: "0.2rem 0.25rem", fontSize: "0.75rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0, marginTop: "1px" }}>
                      {rit.time || `Rit ${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{rit.from}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "1px 0 2px" }}>→ {rit.to}</div>
                      {(rit.passengers || rit.notes) && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          {rit.passengers ? `${rit.passengers} passagiers` : ""}{rit.passengers && rit.notes ? " · " : ""}{rit.notes}
                        </div>
                      )}
                      {rit.from && rit.to && (
                        <a href={mapsLink(rit.from, rit.to)} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                          <Navigation className="w-3 h-3" /> Route openen
                        </a>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(rit)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => save(ritten.filter(r => r.id !== rit.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RitForm({ form, setForm, onSave, onCancel, inputStyle }: {
  form: Omit<Rit, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Rit, "id">>>;
  onSave: () => void;
  onCancel: () => void;
  inputStyle: React.CSSProperties;
}) {
  return (
    <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.875rem", marginBottom: "0.75rem" }} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Vertrektijd</label>
          <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Passagiers</label>
          <input type="number" value={form.passengers} onChange={e => setForm(f => ({ ...f, passengers: e.target.value ? Number(e.target.value) : "" }))} placeholder="Aantal" style={inputStyle} />
        </div>
      </div>
      <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="Ophaaladres *" style={inputStyle} />
      <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} placeholder="Afleverpunt *" style={inputStyle} />
      <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Extra notities" style={inputStyle} />
      <div className="flex gap-2">
        <button onClick={onSave} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem" }}>
          <Check className="w-3.5 h-3.5" /> Opslaan
        </button>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
