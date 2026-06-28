"use client";

import { useState } from "react";
import { Camera, Plus, Trash2, Check, X } from "lucide-react";

type Shot = { id: string; description: string; done: boolean };
type ShotCategory = { id: string; title: string; shots: Shot[] };

const DEFAULT_CATEGORIES: Omit<ShotCategory, "shots">[] = [
  { id: "prep", title: "Voorbereiding" },
  { id: "ceremony", title: "Ceremonie" },
  { id: "portraits", title: "Portretmomenten" },
  { id: "family", title: "Familiefoto's" },
  { id: "details", title: "Details & decoratie" },
  { id: "reception", title: "Receptie & feest" },
];

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
  isPlanner: boolean;
}

export default function ShotlistBuilder({ intakeData, onUpdate, isVendor, isPlanner }: Props) {
  const canEdit = isVendor || isPlanner;
  const raw = intakeData.shotlistCategories as ShotCategory[] | undefined;
  const [categories, setCategories] = useState<ShotCategory[]>(
    raw ?? DEFAULT_CATEGORIES.map(c => ({ ...c, shots: [] }))
  );
  const [adding, setAdding] = useState<{ catId: string; text: string } | null>(null);

  function save(updated: ShotCategory[]) {
    setCategories(updated);
    onUpdate({ shotlistCategories: updated });
  }

  function addShot(catId: string) {
    const text = adding?.text?.trim();
    if (!text) { setAdding(null); return; }
    save(categories.map(c =>
      c.id === catId ? { ...c, shots: [...c.shots, { id: `s-${Date.now()}`, description: text, done: false }] } : c
    ));
    setAdding(null);
  }

  function toggleDone(catId: string, shotId: string) {
    save(categories.map(c =>
      c.id === catId ? { ...c, shots: c.shots.map(s => s.id === shotId ? { ...s, done: !s.done } : s) } : c
    ));
  }

  function deleteShot(catId: string, shotId: string) {
    save(categories.map(c =>
      c.id === catId ? { ...c, shots: c.shots.filter(s => s.id !== shotId) } : c
    ));
  }

  const totalShots = categories.reduce((n, c) => n + c.shots.length, 0);
  const doneShots = categories.reduce((n, c) => n + c.shots.filter(s => s.done).length, 0);

  return (
    <div className="ddp-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold text-sm">Fotolijst</h3>
        </div>
        {totalShots > 0 && (
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", background: "var(--accent)", borderRadius: "9999px", padding: "0.125rem 0.625rem" }}>
            {doneShots}/{totalShots} afgevinkt
          </span>
        )}
      </div>

      <div className="space-y-5">
        {categories.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{cat.title}</span>
              {canEdit && (
                <button onClick={() => setAdding({ catId: cat.id, text: "" })}
                  style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Plus className="w-3 h-3" /> Toevoegen
                </button>
              )}
            </div>

            {adding?.catId === cat.id && (
              <div className="flex gap-2 mb-2">
                <input autoFocus value={adding.text} onChange={e => setAdding({ catId: cat.id, text: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") addShot(cat.id); if (e.key === "Escape") setAdding(null); }}
                  placeholder="Omschrijving foto…" className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white"
                  style={{ borderColor: "var(--border)" }} />
                <button onClick={() => addShot(cat.id)} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.625rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setAdding(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {cat.shots.length === 0 && adding?.catId !== cat.id && (
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen foto's toegevoegd.</p>
            )}

            <div className="space-y-1">
              {cat.shots.map(shot => (
                <div key={shot.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                  <button onClick={() => toggleDone(cat.id, shot.id)}
                    style={{ width: "1.25rem", height: "1.25rem", borderRadius: "4px", border: `2px solid ${shot.done ? "var(--primary)" : "var(--border)"}`, background: shot.done ? "var(--primary)" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {shot.done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="flex-1 text-sm" style={{ color: shot.done ? "var(--muted)" : "var(--foreground)", textDecoration: shot.done ? "line-through" : "none" }}>
                    {shot.description}
                  </span>
                  {canEdit && (
                    <button onClick={() => deleteShot(cat.id, shot.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
