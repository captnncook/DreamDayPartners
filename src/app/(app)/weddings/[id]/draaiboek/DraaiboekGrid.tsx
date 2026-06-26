"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, MapPin, Briefcase } from "lucide-react";

const PPM = 2; // pixels per minute → 120px per hour
const DAY_START = 6 * 60;  // 06:00
const DAY_END = 23 * 60;   // 23:00
const SNAP = 5;             // snap to 5 min while dragging
const TIME_W = 52;
const HANDLE = 8;

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTime(raw: number): string {
  const m = Math.max(DAY_START, Math.min(DAY_END - SNAP, raw));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export type GridItem = {
  id: string;
  startTime: string;
  duration: number;
  title: string;
  description?: string;
  location?: string;
  vendorId?: string | null;
  notes?: string;
  isPublic?: boolean;
  vendor?: { id: string; name: string; category: string } | null;
};

export type WeddingVendorRef = {
  id: string;
  vendor: { id: string; name: string; category: string };
};

function getLayout(items: GridItem[]): Map<string, { col: number; total: number }> {
  const sorted = [...items].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const ends: number[] = [];
  const cols = new Map<string, number>();

  for (const it of sorted) {
    const s = toMin(it.startTime), e = s + it.duration;
    let c = ends.findIndex(x => x <= s);
    if (c < 0) { c = ends.length; ends.push(e); } else { ends[c] = e; }
    cols.set(it.id, c);
  }

  const res = new Map<string, { col: number; total: number }>();
  for (const it of sorted) {
    const s = toMin(it.startTime), e = s + it.duration, c = cols.get(it.id)!;
    let max = c;
    for (const ot of sorted) {
      if (ot.id === it.id) continue;
      const os = toMin(ot.startTime), oe = os + ot.duration;
      if (os < e && oe > s) max = Math.max(max, cols.get(ot.id)!);
    }
    res.set(it.id, { col: c, total: max + 1 });
  }
  return res;
}

const INP: React.CSSProperties = {
  width: "100%", padding: "0.5rem 0.75rem",
  border: "1px solid var(--border)", borderRadius: "8px",
  fontSize: "0.875rem", background: "white", outline: "none",
};

type FormData = { startTime: string; endTime: string; title: string; location: string; vendorId: string; notes: string };

function ItemForm({ init, vendors, onSave, onCancel, saving }: {
  init: FormData;
  vendors: WeddingVendorRef[];
  onSave: (d: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState(init);
  const set = (k: keyof FormData, v: string) => setF(p => ({ ...p, [k]: v }));

  return (
    <div className="ddp-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem" }}>
        {init.title ? "Item bewerken" : "Item toevoegen"}
      </h3>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            Van<br />
            <input type="time" value={f.startTime} onChange={e => set("startTime", e.target.value)} style={{ ...INP, marginTop: "0.25rem" }} />
          </label>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            Tot<br />
            <input type="time" value={f.endTime} onChange={e => set("endTime", e.target.value)} style={{ ...INP, marginTop: "0.25rem" }} />
          </label>
        </div>
        <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
          Titel *<br />
          <input value={f.title} onChange={e => set("title", e.target.value)} placeholder="bijv. Huwelijksinzegening" style={{ ...INP, marginTop: "0.25rem" }} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            Locatie<br />
            <input value={f.location} onChange={e => set("location", e.target.value)} placeholder="bijv. Feestzaal" style={{ ...INP, marginTop: "0.25rem" }} />
          </label>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            Leverancier<br />
            <select value={f.vendorId} onChange={e => set("vendorId", e.target.value)} style={{ ...INP, marginTop: "0.25rem", appearance: "auto" } as React.CSSProperties}>
              <option value="">— geen —</option>
              {vendors.map(v => <option key={v.vendor.id} value={v.vendor.id}>{v.vendor.name}</option>)}
            </select>
          </label>
        </div>
        <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
          Notities<br />
          <input value={f.notes} onChange={e => set("notes", e.target.value)} placeholder="Extra info" style={{ ...INP, marginTop: "0.25rem" }} />
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => { if (f.title.trim()) onSave(f); }}
            disabled={saving || !f.title.trim()}
            className="ddp-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Check className="w-3.5 h-3.5" />{saving ? "Opslaan…" : "Opslaan"}
          </button>
          <button onClick={onCancel} className="ddp-btn-secondary">Annuleren</button>
        </div>
      </div>
    </div>
  );
}

type DragState = { type: "move" | "top" | "bot"; id: string; y0: number; s0: number; d0: number };

interface Props {
  items: GridItem[];
  vendors: WeddingVendorRef[];
  canEditItem: (item: GridItem) => boolean;
  isPlanner: boolean;
  onUpdateItem: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAddItem: (data: Record<string, unknown>) => Promise<void>;
  onTogglePublic: (id: string, current: boolean) => Promise<void>;
}

export default function DraaiboekGrid({
  items, vendors, canEditItem, isPlanner,
  onUpdateItem, onDeleteItem, onAddItem, onTogglePublic,
}: Props) {
  const draftRef = useRef<GridItem[]>(items);
  const [display, setDisplay] = useState<GridItem[]>(items);
  const [selected, setSelected] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [newTime, setNewTime] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const drag = useRef<DragState | null>(null);
  const didDrag = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { draftRef.current = items; setDisplay([...items]); }, [items]);

  const H = (DAY_END - DAY_START) * PPM;
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

  const onMove = useCallback((e: MouseEvent) => {
    const d = drag.current;
    if (!d) return;
    didDrag.current = true;
    const dy = e.clientY - d.y0;
    const dmin = Math.round(dy / PPM / SNAP) * SNAP;
    const next = draftRef.current.map(it => {
      if (it.id !== d.id) return it;
      if (d.type === "move") {
        const ns = Math.max(DAY_START, Math.min(DAY_END - d.d0, d.s0 + dmin));
        return { ...it, startTime: toTime(ns), duration: d.d0 };
      } else if (d.type === "top") {
        const ns = Math.max(DAY_START, Math.min(d.s0 + d.d0 - SNAP, d.s0 + dmin));
        return { ...it, startTime: toTime(ns), duration: Math.max(SNAP, d.s0 + d.d0 - ns) };
      } else {
        return { ...it, duration: Math.max(SNAP, d.d0 + dmin) };
      }
    });
    draftRef.current = next;
    setDisplay([...next]);
  }, []);

  const onUp = useCallback(async () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);

    const it = draftRef.current.find(i => i.id === d.id);
    if (!it) return;
    const origTime = toTime(d.s0);
    if (it.startTime !== origTime || it.duration !== d.d0) {
      await onUpdateItem(it.id, { startTime: it.startTime, duration: it.duration });
    }
    setTimeout(() => { didDrag.current = false; }, 10);
  }, [onMove, onUpdateItem]);

  function startDrag(e: React.MouseEvent, it: GridItem, type: DragState["type"]) {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { type, id: it.id, y0: e.clientY, s0: toMin(it.startTime), d0: it.duration };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function handleGridClick(e: React.MouseEvent) {
    if (didDrag.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const raw = Math.round((y / PPM + DAY_START) / SNAP) * SNAP;
    setNewTime(toTime(Math.max(DAY_START, Math.min(DAY_END - 30, raw))));
    setSelected(null);
    setFormMode("add");
  }

  function endMin(t: string, dur: number) { return toTime(toMin(t) + dur); }

  function addEndTime() {
    const m = toMin(newTime) + 30;
    return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  }

  async function saveNew(f: FormData) {
    setSaving(true);
    const dur = Math.max(SNAP, toMin(f.endTime) - toMin(f.startTime));
    await onAddItem({
      startTime: f.startTime, duration: dur, title: f.title,
      location: f.location || undefined, vendorId: f.vendorId || null,
      notes: f.notes || undefined,
    });
    setSaving(false);
    setFormMode(null);
  }

  async function saveEdit(id: string, f: FormData) {
    setSaving(true);
    const dur = Math.max(SNAP, toMin(f.endTime) - toMin(f.startTime));
    await onUpdateItem(id, {
      startTime: f.startTime, duration: dur, title: f.title,
      location: f.location || undefined, vendorId: f.vendorId || null,
      notes: f.notes || undefined,
    });
    setSaving(false);
    setFormMode(null);
    setSelected(null);
  }

  async function del(id: string) {
    if (!confirm("Item verwijderen?")) return;
    await onDeleteItem(id);
    setSelected(null);
    setFormMode(null);
  }

  const lay = getLayout(display);
  const selItem = selected ? display.find(i => i.id === selected) ?? null : null;

  // 10-min grid lines
  const tenMinLines = Array.from({ length: (DAY_END - DAY_START) / 10 }, (_, i) => i * 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Add form */}
      {formMode === "add" && (
        <ItemForm
          init={{ startTime: newTime, endTime: addEndTime(), title: "", location: "", vendorId: "", notes: "" }}
          vendors={vendors}
          onSave={saveNew}
          onCancel={() => setFormMode(null)}
          saving={saving}
        />
      )}

      {/* Edit form */}
      {formMode === "edit" && selItem && (
        <ItemForm
          init={{
            startTime: selItem.startTime,
            endTime: endMin(selItem.startTime, selItem.duration),
            title: selItem.title,
            location: selItem.location ?? "",
            vendorId: selItem.vendorId ?? "",
            notes: selItem.notes ?? "",
          }}
          vendors={vendors}
          onSave={f => saveEdit(selItem.id, f)}
          onCancel={() => setFormMode(null)}
          saving={saving}
        />
      )}

      {/* Selected item info bar */}
      {selItem && formMode !== "edit" && (
        <div className="ddp-card" style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{selItem.title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <span>{selItem.startTime} – {endMin(selItem.startTime, selItem.duration)}</span>
              {selItem.location && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><MapPin className="w-3 h-3" />{selItem.location}</span>}
              {selItem.vendor && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", textTransform: "capitalize" }}><Briefcase className="w-3 h-3" />{selItem.vendor.category} · {selItem.vendor.name}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
            {isPlanner && (
              <button
                onClick={() => onTogglePublic(selItem.id, selItem.isPublic ?? false)}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 600, background: selItem.isPublic ? "#22c55e20" : "var(--border)", color: selItem.isPublic ? "#16a34a" : "var(--muted)" }}
              >
                {selItem.isPublic ? "Publiek" : "Privé"}
              </button>
            )}
            {canEditItem(selItem) && (
              <>
                <button onClick={() => setFormMode("edit")} className="ddp-btn-secondary" style={{ fontSize: "0.8125rem", padding: "0.3rem 0.75rem" }}>Bewerken</button>
                <button onClick={() => del(selItem.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px", display: "flex" }} title="Verwijderen">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => { setSelected(null); setFormMode(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-light)", padding: "4px", display: "flex" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      {!formMode && !selItem && (
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
          Klik op het raster om een item toe te voegen · Sleep een item om te verplaatsen · Sleep de randen om de tijd aan te passen
        </p>
      )}

      {/* Grid */}
      <div style={{ display: "flex", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}>
        {/* Time labels */}
        <div style={{ width: TIME_W, flexShrink: 0, position: "relative", height: H, pointerEvents: "none" }}>
          {hours.map(min => (
            <div key={min} style={{
              position: "absolute",
              top: (min - DAY_START) * PPM - 7,
              right: 8,
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "var(--muted)",
              lineHeight: 1,
            }}>
              {String(Math.floor(min / 60)).padStart(2, "0")}:{String(min % 60).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Grid + items */}
        <div
          ref={containerRef}
          onClick={handleGridClick}
          style={{
            flex: 1,
            position: "relative",
            height: H,
            background: "white",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            overflow: "hidden",
            cursor: "crosshair",
          }}
        >
          {/* Grid lines */}
          {tenMinLines.map(offset => {
            const isHour = offset % 60 === 0;
            return (
              <div key={offset} style={{
                position: "absolute",
                top: offset * PPM,
                left: 0,
                right: 0,
                height: 0,
                borderTop: isHour ? "1.5px solid var(--border)" : "1px solid #f0ece8",
                pointerEvents: "none",
                zIndex: 0,
              }} />
            );
          })}
          <div style={{ position: "absolute", top: (DAY_END - DAY_START) * PPM, left: 0, right: 0, borderTop: "1.5px solid var(--border)", pointerEvents: "none" }} />

          {/* Hour labels on grid */}
          {hours.map(min => (
            <div key={`lbl-${min}`} style={{
              position: "absolute",
              top: (min - DAY_START) * PPM + 2,
              left: 4,
              fontSize: "0.5625rem",
              color: "#d4cdc8",
              lineHeight: 1,
              pointerEvents: "none",
              zIndex: 0,
            }}>
              {String(Math.floor(min / 60)).padStart(2, "0")}:00
            </div>
          ))}

          {/* Items */}
          {display.map(item => {
            const sm = toMin(item.startTime);
            if (sm >= DAY_END || sm + item.duration <= DAY_START) return null;
            const l = lay.get(item.id);
            if (!l) return null;
            const top = (sm - DAY_START) * PPM;
            const height = Math.max(SNAP * PPM, item.duration * PPM);
            const editable = canEditItem(item);
            const isSel = selected === item.id;
            const endStr = endMin(item.startTime, item.duration);
            const hasVendor = !!item.vendor;
            const borderColor = hasVendor ? "var(--color-blush)" : "#c4b5fd";
            const bgColor = hasVendor ? "var(--color-blush-soft)" : "#f5f3ff";

            return (
              <div
                key={item.id}
                onClick={e => {
                  e.stopPropagation();
                  if (!didDrag.current) {
                    setSelected(isSel ? null : item.id);
                    setFormMode(null);
                  }
                }}
                style={{
                  position: "absolute",
                  top,
                  height,
                  left: `calc(${(l.col / l.total) * 100}% + 2px)`,
                  width: `calc(${(1 / l.total) * 100}% - 4px)`,
                  background: bgColor,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: "6px",
                  zIndex: isSel ? 10 : 2,
                  overflow: "hidden",
                  boxShadow: isSel ? "0 2px 12px rgba(0,0,0,0.15)" : undefined,
                  cursor: editable ? "grab" : "pointer",
                  transition: drag.current?.id === item.id ? "none" : "box-shadow 0.15s",
                }}
              >
                {/* Top resize handle */}
                {editable && (
                  <div
                    onMouseDown={e => startDrag(e, item, "top")}
                    title="Begintijd aanpassen"
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: HANDLE,
                      cursor: "n-resize", zIndex: 4,
                      background: "linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)",
                      borderRadius: "6px 6px 0 0",
                    }}
                  />
                )}

                {/* Body — drag to move */}
                <div
                  onMouseDown={editable ? e => startDrag(e, item, "move") : undefined}
                  style={{
                    position: "absolute",
                    top: HANDLE, bottom: HANDLE, left: 0, right: 0,
                    padding: "1px 5px",
                    overflow: "hidden",
                    cursor: editable ? "grab" : "default",
                  }}
                >
                  <div style={{
                    fontSize: "0.6875rem", fontWeight: 700, lineHeight: 1.3,
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                    color: "var(--foreground)",
                  }}>
                    {item.title}
                  </div>
                  {height > 30 && (
                    <div style={{ fontSize: "0.5625rem", color: "var(--muted)", lineHeight: 1.3, marginTop: "1px" }}>
                      {item.startTime}–{endStr}{item.vendor ? ` · ${item.vendor.name}` : ""}
                    </div>
                  )}
                </div>

                {/* Bottom resize handle */}
                {editable && (
                  <div
                    onMouseDown={e => startDrag(e, item, "bot")}
                    title="Eindtijd aanpassen"
                    style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: HANDLE,
                      cursor: "s-resize", zIndex: 4,
                      background: "linear-gradient(to top, rgba(0,0,0,0.06), transparent)",
                      borderRadius: "0 0 6px 6px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
