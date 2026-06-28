"use client";

import { useState } from "react";
import { ShoppingBag, Plus, Trash2, Check, X } from "lucide-react";

type Material = { id: string; name: string; done: boolean };

const DEFAULT_MATERIALS = [
  "Krultang / stijltang", "Haarlak", "Haarspelden & elastieken", "Föhn",
  "Borstels & kammen", "Haarextensions (indien nodig)", "Make-up tas compleet",
  "Primers & fixatiesprays", "Nepwimpers", "Penselen set",
];

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function MaterialChecklist({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.materialChecklist as Material[] | undefined;
  const [items, setItems] = useState<Material[]>(raw ?? []);
  const [newItem, setNewItem] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  function save(updated: Material[]) {
    setItems(updated);
    onUpdate({ materialChecklist: updated });
  }

  function toggleDone(id: string) {
    save(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    save([...items, { id: `m-${Date.now()}`, name, done: false }]);
    setNewItem("");
  }

  function deleteItem(id: string) {
    save(items.filter(it => it.id !== id));
  }

  function addDefaults() {
    const existing = new Set(items.map(i => i.name.toLowerCase()));
    const toAdd = DEFAULT_MATERIALS.filter(d => !existing.has(d.toLowerCase()))
      .map(d => ({ id: `m-${Date.now()}-${Math.random()}`, name: d, done: false }));
    save([...items, ...toAdd]);
  }

  const done = items.filter(i => i.done).length;

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Materiaalchecklist</h3>
        </div>
        {items.length > 0 && (
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", background: "var(--accent)", borderRadius: "9999px", padding: "0.125rem 0.625rem" }}>
            {done}/{items.length} klaar
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic", marginBottom: "0.75rem" }}>
            {canEdit ? "Stel een checklist in van materialen om mee te nemen." : "Nog geen checklist aangemaakt."}
          </p>
          {canEdit && (
            <button onClick={addDefaults} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.375rem 0.75rem", cursor: "pointer", fontWeight: 600 }}>
              + Standaard materialen toevoegen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
              <button onClick={() => toggleDone(item.id)}
                style={{ width: "1.25rem", height: "1.25rem", borderRadius: "4px", border: `2px solid ${item.done ? "var(--primary)" : "var(--border)"}`, background: item.done ? "var(--primary)" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {item.done && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="flex-1 text-sm" style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--muted)" : "var(--foreground)" }}>
                {item.name}
              </span>
              {canEdit && (
                <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div style={{ marginTop: "0.75rem" }}>
          {showAdd ? (
            <div className="flex gap-2">
              <input autoFocus value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setShowAdd(false); }}
                placeholder="Materiaal toevoegen…" className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white"
                style={{ borderColor: "var(--border)" }} />
              <button onClick={addItem} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.625rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} style={{ fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Plus className="w-3.5 h-3.5" /> Materiaal toevoegen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
