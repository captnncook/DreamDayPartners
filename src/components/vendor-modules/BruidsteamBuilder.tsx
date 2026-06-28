"use client";

import { useState } from "react";
import { Users, Plus, Trash2, Edit2, Check, X } from "lucide-react";

type BruidsteamPerson = {
  id: string;
  name: string;
  role: string;
  stijl: string;
  haarlengte: string;
  notities: string;
};

const ROLES = ["Bruid", "Bruidsmeisje", "Moeder van de bruid", "Moeder van de bruidegom", "Getuige", "Bloemenkind", "Overig"];
const HAARLENGTES = ["Kort", "Middellang", "Lang", "Heel lang"];

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

const EMPTY_FORM = { name: "", role: "Bruid", stijl: "", haarlengte: "Middellang", notities: "" };

export default function BruidsteamBuilder({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const rawPersons = intakeData.bruidsteam as BruidsteamPerson[] | undefined;
  const [persons, setPersons] = useState<BruidsteamPerson[]>(rawPersons ?? []);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function save(updated: BruidsteamPerson[]) {
    setPersons(updated);
    onUpdate({ bruidsteam: updated });
  }

  function startAdd() {
    setEditingId("new");
    setForm(EMPTY_FORM);
  }

  function startEdit(p: BruidsteamPerson) {
    setEditingId(p.id);
    setForm({ name: p.name, role: p.role, stijl: p.stijl, haarlengte: p.haarlengte, notities: p.notities });
  }

  function savePerson() {
    if (!form.name.trim()) return;
    if (editingId === "new") {
      save([...persons, { id: `p-${Date.now()}`, ...form }]);
    } else {
      save(persons.map(p => p.id === editingId ? { ...p, ...form } : p));
    }
    setEditingId(null);
  }

  function deletePerson(id: string) {
    save(persons.filter(p => p.id !== id));
  }

  const sel = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", fontSize: "0.875rem", background: "white", color: "var(--foreground)" } as const;

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Bruidsteam per look</h3>
        </div>
        {canEdit && (
          <button onClick={startAdd} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Plus className="w-3.5 h-3.5" /> Persoon toevoegen
          </button>
        )}
      </div>

      {editingId === "new" && (
        <PersonForm form={form} setForm={setForm} onSave={savePerson} onCancel={() => setEditingId(null)} sel={sel} />
      )}

      {persons.length === 0 && editingId !== "new" && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          {canEdit ? "Voeg de personen toe die haar en make-up krijgen." : "Nog geen personen toegevoegd."}
        </p>
      )}

      <div className="space-y-2">
        {persons.map(p => (
          <div key={p.id}>
            {editingId === p.id ? (
              <PersonForm form={form} setForm={setForm} onSave={savePerson} onCancel={() => setEditingId(null)} sel={sel} />
            ) : (
              <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "1px" }}>{p.role} · {p.haarlengte} haar</div>
                    {p.stijl && <div style={{ fontSize: "0.8125rem", color: "var(--foreground)", marginTop: "0.375rem" }}>{p.stijl}</div>}
                    {p.notities && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>{p.notities}</div>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletePerson(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
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

function PersonForm({ form, setForm, onSave, onCancel, sel }: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onSave: () => void;
  onCancel: () => void;
  sel: React.CSSProperties;
}) {
  return (
    <div style={{ background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.875rem", marginBottom: "0.75rem" }} className="space-y-2">
      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Naam *"
        style={{ ...sel, marginBottom: 0 }} />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={sel}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={form.haarlengte} onChange={e => setForm(p => ({ ...p, haarlengte: e.target.value }))} style={sel}>
          {HAARLENGTES.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
      <input value={form.stijl} onChange={e => setForm(p => ({ ...p, stijl: e.target.value }))} placeholder="Gewenste stijl / look"
        style={sel} />
      <input value={form.notities} onChange={e => setForm(p => ({ ...p, notities: e.target.value }))} placeholder="Extra notities (optioneel)"
        style={sel} />
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
