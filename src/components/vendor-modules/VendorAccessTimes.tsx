"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, Edit2, Check, X } from "lucide-react";

type AccessSlot = {
  id: string;
  vendorType: string;
  accessTime: string;
  exitTime: string;
  notes: string;
};

const VENDOR_TYPES = [
  "Bloemist / decorateur", "Fotograaf", "Videograaf", "DJ / muziek", "Catering",
  "Bruidstaart", "Haarstylist / visagist", "Trouwauto", "Verhuur", "Overig leverancier",
];

const EMPTY: Omit<AccessSlot, "id"> = { vendorType: "Bloemist / decorateur", accessTime: "", exitTime: "", notes: "" };

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function VendorAccessTimes({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.vendorAccessTimes as AccessSlot[] | undefined;
  const [slots, setSlots] = useState<AccessSlot[]>(raw ?? []);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);

  function save(updated: AccessSlot[]) {
    setSlots(updated);
    onUpdate({ vendorAccessTimes: updated });
  }

  function startAdd() { setEditingId("new"); setForm(EMPTY); }
  function startEdit(s: AccessSlot) { setEditingId(s.id); setForm({ vendorType: s.vendorType, accessTime: s.accessTime, exitTime: s.exitTime, notes: s.notes }); }

  function saveSlot() {
    if (!form.accessTime) return;
    const slot: AccessSlot = { id: editingId === "new" ? `a-${Date.now()}` : editingId!, ...form };
    if (editingId === "new") save([...slots, slot].sort((a, b) => a.accessTime.localeCompare(b.accessTime)));
    else save(slots.map(s => s.id === editingId ? slot : s));
    setEditingId(null);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" };

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <div>
            <h3 className="font-semibold text-sm">Leverancierstoegang</h3>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>Toegangstijden per leverancier op de trouwdag</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={startAdd} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Plus className="w-3.5 h-3.5" /> Toevoegen
          </button>
        )}
      </div>

      {editingId === "new" && (
        <SlotForm form={form} setForm={setForm} onSave={saveSlot} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
      )}

      {slots.length === 0 && editingId !== "new" && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg toegangstijden toe per leverancierstype." : "Nog geen toegangstijden ingesteld."}
        </p>
      )}

      <div className="space-y-2">
        {slots.map(slot => (
          <div key={slot.id}>
            {editingId === slot.id ? (
              <SlotForm form={form} setForm={setForm} onSave={saveSlot} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
            ) : (
              <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ minWidth: "3rem", textAlign: "center", background: "var(--primary)", color: "white", borderRadius: "6px", padding: "0.2rem 0.375rem", fontSize: "0.8125rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {slot.accessTime}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{slot.vendorType}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {slot.accessTime}{slot.exitTime ? ` – ${slot.exitTime}` : ""}
                    {slot.notes ? ` · ${slot.notes}` : ""}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => startEdit(slot)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => save(slots.filter(s => s.id !== slot.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlotForm({ form, setForm, onSave, onCancel, inputStyle }: {
  form: Omit<AccessSlot, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<AccessSlot, "id">>>;
  onSave: () => void;
  onCancel: () => void;
  inputStyle: React.CSSProperties;
}) {
  return (
    <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.875rem", marginBottom: "0.75rem" }} className="space-y-2">
      <select value={form.vendorType} onChange={e => setForm(f => ({ ...f, vendorType: e.target.value }))} style={inputStyle}>
        {VENDOR_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Toegang vanaf *</label>
          <input type="time" value={form.accessTime} onChange={e => setForm(f => ({ ...f, accessTime: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem", display: "block" }}>Weg vóór</label>
          <input type="time" value={form.exitTime} onChange={e => setForm(f => ({ ...f, exitTime: e.target.value }))} style={inputStyle} />
        </div>
      </div>
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
