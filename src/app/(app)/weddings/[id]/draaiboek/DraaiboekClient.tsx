"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Briefcase, MapPin, MessageSquare, X, Clock, Pencil, Check, Plus } from "lucide-react";

type DraaiboekItem = {
  id: string;
  startTime: string;
  duration: number;
  title: string;
  description?: string;
  location?: string;
  sortOrder: number;
  vendorId?: string;
  notes?: string;
  vendor?: { id: string; name: string; category: string } | null;
};

type Draaiboek = {
  id: string;
  title: string;
  version: string;
  status: string;
  items: DraaiboekItem[];
};

type TeamMember = { id: string; role: string; user: { id: string; name: string } };
type WeddingVendor = { id: string; vendor: { id: string; name: string; category: string } };

interface Props {
  weddingId: string;
  weddingTitle: string;
  weddingDate: string;
  draaiboeken: Draaiboek[];
  teamMembers: TeamMember[];
  vendors: WeddingVendor[];
  currentUser: { id: string; role: string; name: string };
  isPremium: boolean;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function diffMinutes(from: string, to: string): number {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  return Math.max(5, th * 60 + tm - (fh * 60 + fm));
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}u ${m}min` : `${h}u`;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.875rem",
  outline: "none",
  background: "white",
  color: "var(--foreground)",
};

function ItemForm({
  initial,
  vendors,
  onSave,
  onCancel,
  saving,
}: {
  initial: { startTime: string; endTime: string; title: string; description: string; location: string; vendorId: string; notes: string };
  vendors: WeddingVendor[];
  onSave: (data: typeof initial) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="ddp-card mb-5" style={{ borderColor: "var(--color-blush)" }}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
        {initial.title ? "Item bewerken" : "Item toevoegen"}
      </h3>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Van</label>
            <input type="time" value={form.startTime}
              onChange={(e) => {
                const start = e.target.value;
                set("startTime", start);
                set("endTime", addMinutes(start, diffMinutes(form.startTime, form.endTime)));
              }}
              style={INPUT_STYLE} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Tot</label>
            <input type="time" value={form.endTime} min={form.startTime}
              onChange={(e) => set("endTime", e.target.value)}
              style={INPUT_STYLE} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Duur</label>
            <div style={{ ...INPUT_STYLE, background: "var(--color-blush-soft)", color: "var(--muted)" }}>
              {formatDuration(diffMinutes(form.startTime, form.endTime))}
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Titel *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="bijv. Huwelijksinzegening" style={INPUT_STYLE} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Locatie</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="bijv. Feestzaal" style={INPUT_STYLE} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Leverancier</label>
            <select value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)} style={{ ...INPUT_STYLE, appearance: "auto" }}>
              <option value="">— geen —</option>
              {vendors.map((v) => <option key={v.vendor.id} value={v.vendor.id}>{v.vendor.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Notities</label>
          <input value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Extra info" style={INPUT_STYLE} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { if (form.title.trim()) onSave(form); }}
            disabled={saving || !form.title.trim()}
            className="ddp-btn-primary inline-flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> {saving ? "Opslaan…" : "Opslaan"}
          </button>
          <button onClick={onCancel} className="ddp-btn-secondary">Annuleren</button>
        </div>
      </div>
    </div>
  );
}

export default function DraaiboekClient({ weddingId, weddingTitle, draaiboeken: initial, vendors, currentUser }: Props) {
  const [draaiboeken, setDraaiboeken] = useState<Draaiboek[]>(initial);
  const [activeDraaiboekId, setActiveDraaiboekId] = useState<string | null>(initial[0]?.id ?? null);
  const [showNewDraaiboek, setShowNewDraaiboek] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newDraaiboekTitle, setNewDraaiboekTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const emptyItem = { startTime: "09:00", endTime: "09:30", title: "", description: "", location: "", vendorId: "", notes: "" };

  const activeDraaiboek = draaiboeken.find((d) => d.id === activeDraaiboekId);
  const isReadOnly = currentUser.role === "couple" || currentUser.role === "vendor";

  // Collect unique vendor categories that appear in the active draaiboek
  const vendorCategories = Array.from(
    new Set(
      (activeDraaiboek?.items ?? [])
        .map(i => i.vendor?.category)
        .filter(Boolean) as string[]
    )
  ).sort();

  const visibleItems = (activeDraaiboek?.items ?? []).filter(item =>
    filterCategory === "all" || item.vendor?.category === filterCategory
  );

  async function createDraaiboek(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newDraaiboekTitle }),
    });
    const data = await res.json();
    if (data.draaiboek) {
      setDraaiboeken((prev) => [{ ...data.draaiboek, items: [] }, ...prev]);
      setActiveDraaiboekId(data.draaiboek.id);
    }
    setNewDraaiboekTitle("");
    setShowNewDraaiboek(false);
    setSaving(false);
  }

  async function addItem(form: typeof emptyItem) {
    if (!activeDraaiboekId) return;
    setSaving(true);
    const duration = diffMinutes(form.startTime, form.endTime);
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: form.startTime, duration, title: form.title,
        description: form.description, location: form.location,
        notes: form.notes, vendorId: form.vendorId || null,
        sortOrder: (activeDraaiboek?.items.length ?? 0) + 1,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken((prev) =>
        prev.map((d) => d.id === activeDraaiboekId
          ? { ...d, items: [...d.items, data.item].sort((a, b) => a.sortOrder - b.sortOrder) }
          : d)
      );
    }
    setShowAddItem(false);
    setSaving(false);
  }

  async function updateItem(itemId: string, form: typeof emptyItem) {
    if (!activeDraaiboekId) return;
    setSaving(true);
    const duration = diffMinutes(form.startTime, form.endTime);
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: form.startTime, duration, title: form.title,
        description: form.description, location: form.location,
        notes: form.notes, vendorId: form.vendorId || null,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken((prev) =>
        prev.map((d) => d.id === activeDraaiboekId
          ? { ...d, items: d.items.map((i) => i.id === itemId ? data.item : i).sort((a, b) => a.sortOrder - b.sortOrder) }
          : d)
      );
    }
    setEditingItemId(null);
    setSaving(false);
  }

  async function deleteItem(draaiboekId: string, itemId: string) {
    if (!confirm("Item verwijderen?")) return;
    await fetch(`/api/weddings/${weddingId}/draaiboek/${draaiboekId}/items/${itemId}`, { method: "DELETE" });
    setDraaiboeken((prev) =>
      prev.map((d) => d.id === draaiboekId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d)
    );
  }

  return (
    <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/weddings/${weddingId}`} className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: "var(--muted)" }}>
          ← Terug naar {weddingTitle}
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 style={{ fontSize: "clamp(1.375rem, 4vw, 1.875rem)", fontWeight: 700, letterSpacing: "-0.04em" }}>Draaiboek</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "2px" }}>{weddingTitle}</p>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2">
              {activeDraaiboek && (
                <button onClick={() => { setShowAddItem(!showAddItem); setEditingItemId(null); }} className="ddp-btn-primary inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Item toevoegen
                </button>
              )}
              <button onClick={() => setShowNewDraaiboek(!showNewDraaiboek)} className="ddp-btn-secondary">
                + Nieuw draaiboek
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New draaiboek form */}
      {showNewDraaiboek && !isReadOnly && (
        <form onSubmit={createDraaiboek} className="ddp-card mb-5 flex gap-3">
          <input required value={newDraaiboekTitle} onChange={(e) => setNewDraaiboekTitle(e.target.value)}
            placeholder="Naam draaiboek (bijv. Draaiboek Trouwdag)" style={{ ...INPUT_STYLE, flex: 1 }} />
          <button type="submit" disabled={saving} className="ddp-btn-primary">Aanmaken</button>
        </form>
      )}

      {draaiboeken.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-rose)" }} />
          <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>Nog geen draaiboek</h2>
          <p className="text-sm mb-4">Maak een draaiboek aan om de tijdlijn van de trouwdag te plannen</p>
          {!isReadOnly && (
            <button onClick={() => setShowNewDraaiboek(true)} className="ddp-btn-primary">Draaiboek aanmaken</button>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: versie picker */}
          <div style={{ width: "100%", maxWidth: "220px", flexShrink: 0 }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "0.75rem" }}>Versies</p>
            <div className="flex flex-col gap-1.5">
              {draaiboeken.map((d) => (
                <button key={d.id} onClick={() => setActiveDraaiboekId(d.id)}
                  style={{
                    textAlign: "left", padding: "0.75rem 0.875rem", borderRadius: "12px",
                    border: "1px solid",
                    borderColor: activeDraaiboekId === d.id ? "var(--color-blush)" : "var(--border)",
                    background: activeDraaiboekId === d.id ? "var(--color-blush-soft)" : "white",
                    cursor: "pointer", transition: "all 150ms",
                  }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }} className="truncate">{d.title}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>v{d.version}</span>
                    <span className={`ddp-badge ${d.status === "final" ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.6rem" }}>
                      {d.status === "final" ? "Definitief" : "Concept"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main: timeline */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {activeDraaiboek && (
              <>
                {showAddItem && !isReadOnly && (
                  <ItemForm
                    initial={emptyItem}
                    vendors={vendors}
                    onSave={(form) => { addItem(form); }}
                    onCancel={() => setShowAddItem(false)}
                    saving={saving}
                  />
                )}

                {/* Filter chips */}
                {vendorCategories.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <button
                      onClick={() => setFilterCategory("all")}
                      style={{
                        padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600,
                        border: "1px solid", cursor: "pointer",
                        borderColor: filterCategory === "all" ? "var(--primary)" : "var(--border)",
                        background: filterCategory === "all" ? "var(--primary)" : "white",
                        color: filterCategory === "all" ? "white" : "var(--muted)",
                      }}
                    >
                      Alles
                    </button>
                    {vendorCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat === filterCategory ? "all" : cat)}
                        style={{
                          padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600,
                          border: "1px solid", cursor: "pointer", textTransform: "capitalize",
                          borderColor: filterCategory === cat ? "var(--primary)" : "var(--border)",
                          background: filterCategory === cat ? "var(--primary)" : "white",
                          color: filterCategory === cat ? "white" : "var(--muted)",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {activeDraaiboek.items.length === 0 ? (
                  <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}>
                    <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--color-rose)" }} />
                    <p style={{ fontSize: "0.9375rem" }}>Nog geen items. Voeg het eerste moment toe.</p>
                  </div>
                ) : visibleItems.length === 0 ? (
                  <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}>
                    <p style={{ fontSize: "0.9375rem" }}>Geen items voor dit filter.</p>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    {/* Timeline line */}
                    <div style={{ position: "absolute", left: "5.25rem", top: 0, bottom: 0, width: "1px", background: "var(--border)" }} />
                    <div className="flex flex-col gap-3">
                      {visibleItems.map((item) => {
                        const endTime = addMinutes(item.startTime, item.duration);
                        const isEditing = editingItemId === item.id;
                        return (
                          <div key={item.id}>
                            {isEditing && !isReadOnly ? (
                              <div style={{ paddingLeft: "6.5rem" }}>
                                <ItemForm
                                  initial={{
                                    startTime: item.startTime,
                                    endTime,
                                    title: item.title,
                                    description: item.description ?? "",
                                    location: item.location ?? "",
                                    vendorId: item.vendorId ?? "",
                                    notes: item.notes ?? "",
                                  }}
                                  vendors={vendors}
                                  onSave={(form) => updateItem(item.id, form)}
                                  onCancel={() => setEditingItemId(null)}
                                  saving={saving}
                                />
                              </div>
                            ) : (
                              <div className="flex gap-3 items-start" style={{ position: "relative" }}>
                                {/* Time */}
                                <div style={{ width: "84px", minWidth: "84px", textAlign: "right", paddingTop: "0.75rem" }}>
                                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--foreground)" }}>{item.startTime}</span>
                                  <div style={{ fontSize: "0.6875rem", color: "var(--muted-light)" }}>{endTime}</div>
                                </div>
                                {/* Dot */}
                                <div style={{ flexShrink: 0, width: "16px", display: "flex", justifyContent: "center", paddingTop: "1rem" }}>
                                  <div style={{
                                    width: "10px", height: "10px", borderRadius: "50%", zIndex: 1,
                                    background: item.vendor ? "var(--color-charcoal)" : "white",
                                    border: "2px solid var(--color-charcoal)",
                                  }} />
                                </div>
                                {/* Card */}
                                <div className="ddp-card flex-1 mb-0" style={{ padding: "0.875rem 1rem" }}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.title}</div>
                                      {item.description && (
                                        <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "2px" }}>{item.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "6px", background: "var(--color-blush-soft)", color: "var(--muted)", whiteSpace: "nowrap" }}>
                                        {item.startTime} – {endTime}
                                      </span>
                                      {!isReadOnly && (
                                        <>
                                          <button
                                            onClick={() => { setEditingItemId(item.id); setShowAddItem(false); }}
                                            style={{ padding: "4px", borderRadius: "6px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                                            title="Bewerken"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => deleteItem(activeDraaiboekId!, item.id)}
                                            style={{ padding: "4px", borderRadius: "6px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
                                            title="Verwijderen"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    {item.location && (
                                      <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--muted)" }}>
                                        <MapPin className="w-3 h-3" /> {item.location}
                                      </span>
                                    )}
                                    {item.vendor && (
                                      <span className="ddp-badge badge-champagne" style={{ fontSize: "0.6875rem", display: "flex", alignItems: "center", gap: "4px", textTransform: "capitalize" }}>
                                        <Briefcase className="w-3 h-3" />
                                        {item.vendor.category} · {item.vendor.name}
                                      </span>
                                    )}
                                    {item.notes && (
                                      <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--muted)" }}>
                                        <MessageSquare className="w-3 h-3" /> {item.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
