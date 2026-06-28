"use client";

import { useState } from "react";
import { Building2, Plus, Trash2, Edit2, Check, X } from "lucide-react";

type VenueRoom = {
  id: string;
  name: string;
  function: string;
  capacity: number | "";
  notes: string;
};

const FUNCTIONS = ["Ceremonie", "Diner", "Feest / dans", "Bruidskamer", "Bar / lounge", "Fotostudio", "Overig"];

const EMPTY: Omit<VenueRoom, "id"> = { name: "", function: "Ceremonie", capacity: "", notes: "" };

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function VenueRooms({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.venueRooms as VenueRoom[] | undefined;
  const [rooms, setRooms] = useState<VenueRoom[]>(raw ?? []);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);

  function save(updated: VenueRoom[]) {
    setRooms(updated);
    onUpdate({ venueRooms: updated });
  }

  function startAdd() { setEditingId("new"); setForm(EMPTY); }
  function startEdit(r: VenueRoom) { setEditingId(r.id); setForm({ name: r.name, function: r.function, capacity: r.capacity, notes: r.notes }); }

  function saveRoom() {
    if (!form.name.trim()) return;
    const room: VenueRoom = { id: editingId === "new" ? `r-${Date.now()}` : editingId!, ...form };
    if (editingId === "new") save([...rooms, room]);
    else save(rooms.map(r => r.id === editingId ? room : r));
    setEditingId(null);
  }

  const totalCapacity = rooms.reduce((s, r) => s + (Number(r.capacity) || 0), 0);

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" };

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <div>
            <h3 className="font-semibold text-sm">Beschikbare ruimtes</h3>
            {rooms.length > 0 && (
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>
                {rooms.length} ruimte{rooms.length !== 1 ? "s" : ""} · {totalCapacity > 0 ? `${totalCapacity} p. totaal` : ""}
              </p>
            )}
          </div>
        </div>
        {canEdit && (
          <button onClick={startAdd} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Plus className="w-3.5 h-3.5" /> Ruimte toevoegen
          </button>
        )}
      </div>

      {editingId === "new" && (
        <RoomForm form={form} setForm={setForm} onSave={saveRoom} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
      )}

      {rooms.length === 0 && editingId !== "new" && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg de ruimtes toe die beschikbaar zijn op de locatie." : "Nog geen ruimtes geconfigureerd."}
        </p>
      )}

      <div className="space-y-2">
        {rooms.map(room => (
          <div key={room.id}>
            {editingId === room.id ? (
              <RoomForm form={form} setForm={setForm} onSave={saveRoom} onCancel={() => setEditingId(null)} inputStyle={inputStyle} />
            ) : (
              <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{room.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "1px" }}>
                      {room.function}{room.capacity ? ` · max. ${room.capacity} personen` : ""}
                    </div>
                    {room.notes && <div style={{ fontSize: "0.8125rem", color: "var(--foreground)", marginTop: "0.375rem" }}>{room.notes}</div>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(room)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => save(rooms.filter(r => r.id !== room.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
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

function RoomForm({ form, setForm, onSave, onCancel, inputStyle }: {
  form: Omit<VenueRoom, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<VenueRoom, "id">>>;
  onSave: () => void;
  onCancel: () => void;
  inputStyle: React.CSSProperties;
}) {
  return (
    <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.875rem", marginBottom: "0.75rem" }} className="space-y-2">
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Naam ruimte *" style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.function} onChange={e => setForm(f => ({ ...f, function: e.target.value }))} style={inputStyle}>
          {FUNCTIONS.map(fn => <option key={fn} value={fn}>{fn}</option>)}
        </select>
        <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value ? Number(e.target.value) : "" }))} placeholder="Max. personen" style={inputStyle} />
      </div>
      <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Extra info (optioneel)" style={inputStyle} />
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
