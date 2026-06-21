"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Briefcase, MapPin, MessageSquare, X, Clock } from "lucide-react";

type DraaiboekItem = {
  id: string;
  startTime: string;
  duration: number;
  title: string;
  description?: string;
  location?: string;
  sortOrder: number;
  assignedUserId?: string;
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

export default function DraaiboekClient({ weddingId, weddingTitle, weddingDate, draaiboeken: initial, teamMembers, vendors, currentUser, isPremium }: Props) {
  const [draaiboeken, setDraaiboeken] = useState<Draaiboek[]>(initial);
  const [activeDraaiboekId, setActiveDraaiboekId] = useState<string | null>(initial[0]?.id ?? null);
  const [showNewDraaiboek, setShowNewDraaiboek] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newDraaiboekTitle, setNewDraaiboekTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    startTime: "09:00", endTime: "09:30", title: "", description: "", location: "", vendorId: "", notes: "",
  });

  const activeDraaiboek = draaiboeken.find((d) => d.id === activeDraaiboekId);
  const isReadOnly = currentUser.role === "couple" || currentUser.role === "vendor";

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

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDraaiboekId) return;
    setSaving(true);
    const duration = diffMinutes(newItem.startTime, newItem.endTime);
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: newItem.startTime,
        duration,
        title: newItem.title,
        description: newItem.description,
        location: newItem.location,
        notes: newItem.notes,
        vendorId: newItem.vendorId || null,
        sortOrder: (activeDraaiboek?.items.length ?? 0) + 1,
      }),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken((prev) =>
        prev.map((d) =>
          d.id === activeDraaiboekId ? { ...d, items: [...d.items, data.item].sort((a, b) => a.sortOrder - b.sortOrder) } : d
        )
      );
    }
    setNewItem({ startTime: "09:00", endTime: "09:30", title: "", description: "", location: "", vendorId: "", notes: "" });
    setShowAddItem(false);
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${weddingId}`} className="text-sm" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-2xl font-bold">Draaiboek</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{weddingTitle}</p>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2">
              {activeDraaiboek && (
                <button onClick={() => setShowAddItem(!showAddItem)} className="ddp-btn-primary">
                  {showAddItem ? "Annuleren" : "+ Item toevoegen"}
                </button>
              )}
              <button onClick={() => setShowNewDraaiboek(!showNewDraaiboek)} className="ddp-btn-secondary">
                + Nieuw draaiboek
              </button>
            </div>
          )}
          {currentUser.role === "vendor" && (
            <div className="ddp-badge badge-premium">Leveranciersweergave</div>
          )}
        </div>
      </div>

      {showNewDraaiboek && !isReadOnly && (
        <form onSubmit={createDraaiboek} className="ddp-card mb-6 flex gap-3">
          <input required value={newDraaiboekTitle} onChange={(e) => setNewDraaiboekTitle(e.target.value)}
            placeholder="Naam draaiboek (bijv. Draaiboek Trouwdag)" className="flex-1 border rounded-lg px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }} />
          <button type="submit" disabled={saving} className="ddp-btn-primary">Aanmaken</button>
        </form>
      )}

      {draaiboeken.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="flex justify-center mb-3"><ClipboardList className="w-10 h-10" style={{ color: "var(--accent-dark)" }} /></div>
          <h2 className="font-semibold text-lg mb-2">Nog geen draaiboek</h2>
          <p className="text-sm mb-4">Maak een draaiboek aan om de tijdlijn van de trouwdag te plannen</p>
          {!isReadOnly && (
            <button onClick={() => setShowNewDraaiboek(true)} className="ddp-btn-primary">Draaiboek aanmaken</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Versies</div>
            {draaiboeken.map((d) => (
              <button key={d.id} onClick={() => setActiveDraaiboekId(d.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  background: activeDraaiboekId === d.id ? "var(--accent)" : "transparent",
                  color: activeDraaiboekId === d.id ? "var(--primary-dark)" : "var(--foreground)",
                  border: "1px solid var(--border)",
                }}>
                <div className="font-medium truncate">{d.title}</div>
                <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--muted)" }}>
                  <span>v{d.version}</span>
                  <span className={`ddp-badge ${d.status === "final" ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.6rem" }}>
                    {d.status === "final" ? "Definitief" : "Concept"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="col-span-3">
            {activeDraaiboek && (
              <>
                {showAddItem && !isReadOnly && (
                  <form onSubmit={addItem} className="ddp-card mb-6 space-y-4">
                    <h3 className="font-semibold">Item toevoegen</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Van</label>
                        <input
                          type="time"
                          value={newItem.startTime}
                          onChange={(e) => {
                            const start = e.target.value;
                            setNewItem((p) => ({
                              ...p,
                              startTime: start,
                              endTime: addMinutes(start, diffMinutes(p.startTime, p.endTime)),
                            }));
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tot</label>
                        <input
                          type="time"
                          value={newItem.endTime}
                          min={newItem.startTime}
                          onChange={(e) => setNewItem((p) => ({ ...p, endTime: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Duur</label>
                        <div className="border rounded-lg px-3 py-2 text-sm flex items-center" style={{ borderColor: "var(--border)", background: "var(--accent)", color: "var(--muted)" }}>
                          {formatDuration(diffMinutes(newItem.startTime, newItem.endTime))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1">Leverancier</label>
                        <select value={newItem.vendorId} onChange={(e) => setNewItem((p) => ({ ...p, vendorId: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                          <option value="">— geen —</option>
                          {vendors.map((v) => <option key={v.vendor.id} value={v.vendor.id}>{v.vendor.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Titel *</label>
                      <input required value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                        placeholder="bijv. Huwelijksinzegening" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Locatie</label>
                        <input value={newItem.location} onChange={(e) => setNewItem((p) => ({ ...p, location: e.target.value }))}
                          placeholder="bijv. Feestzaal" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Notities</label>
                        <input value={newItem.notes} onChange={(e) => setNewItem((p) => ({ ...p, notes: e.target.value }))}
                          placeholder="Extra info" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
                      </div>
                    </div>
                    <button type="submit" disabled={saving} className="ddp-btn-primary w-full">
                      {saving ? "Toevoegen..." : "Item toevoegen"}
                    </button>
                  </form>
                )}

                {activeDraaiboek.items.length === 0 ? (
                  <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                    <div className="flex justify-center mb-2"><Clock className="w-8 h-8" style={{ color: "var(--accent-dark)" }} /></div>
                    <p>Nog geen items. Voeg het eerste moment toe.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[5.5rem] top-0 bottom-0 w-0.5" style={{ background: "var(--border)", marginLeft: "-1px" }} />
                    <div className="space-y-4">
                      {activeDraaiboek.items.map((item) => {
                        const endTime = addMinutes(item.startTime, item.duration);
                        return (
                          <div key={item.id} className="flex gap-4 relative">
                            <div className="w-20 text-right flex-shrink-0 pt-3">
                              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{item.startTime}</span>
                              <div className="text-xs" style={{ color: "var(--muted)" }}>{endTime}</div>
                            </div>
                            <div className="flex-shrink-0 w-4 flex items-start justify-center pt-3.5">
                              <div className="w-3 h-3 rounded-full border-2 z-10"
                                style={{ background: item.vendor ? "var(--primary)" : "white", borderColor: "var(--primary)" }} />
                            </div>
                            <div className="flex-1 ddp-card mb-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-medium text-sm">{item.title}</div>
                                  {item.description && (
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: "var(--accent)", color: "var(--muted)" }}>
                                    {item.startTime} – {endTime}
                                  </span>
                                  {!isReadOnly && (
                                    <button onClick={() => deleteItem(activeDraaiboekId!, item.id)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}><X className="w-3.5 h-3.5" /></button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {item.location && (
                                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><MapPin className="w-3 h-3" /> {item.location}</span>
                                )}
                                {item.vendor && (
                                  <span className="ddp-badge badge-info text-xs flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> {item.vendor.name}
                                  </span>
                                )}
                                {item.notes && (
                                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}><MessageSquare className="w-3 h-3" /> {item.notes}</span>
                                )}
                              </div>
                            </div>
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
