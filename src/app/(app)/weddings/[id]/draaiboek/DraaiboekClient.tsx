"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Printer } from "lucide-react";
import DraaiboekGrid, { type GridItem, type WeddingVendorRef } from "./DraaiboekGrid";

type DraaiboekItem = GridItem;

type Draaiboek = {
  id: string;
  title: string;
  version: string;
  status: string;
  items: DraaiboekItem[];
};

type TeamMember = { id: string; role: string; user: { id: string; name: string } };
type WeddingVendor = WeddingVendorRef;

interface Props {
  weddingId: string;
  weddingTitle: string;
  weddingDate: string;
  draaiboeken: Draaiboek[];
  teamMembers: TeamMember[];
  vendors: WeddingVendor[];
  currentUser: { id: string; role: string; name: string };
  isPremium: boolean;
  ownVendorId?: string | null;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem",
  border: "1px solid var(--border)", borderRadius: "10px",
  fontSize: "0.875rem", outline: "none", background: "white",
};

export default function DraaiboekClient({
  weddingId, weddingTitle, draaiboeken: initial, vendors, currentUser, ownVendorId,
}: Props) {
  const [draaiboeken, setDraaiboeken] = useState<Draaiboek[]>(initial);
  const [activeDraaiboekId, setActiveDraaiboekId] = useState<string | null>(initial[0]?.id ?? null);
  const [showNewDraaiboek, setShowNewDraaiboek] = useState(false);
  const [newDraaiboekTitle, setNewDraaiboekTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const activeDraaiboek = draaiboeken.find(d => d.id === activeDraaiboekId);
  const isPlanner = ["admin", "planner", "team_member"].includes(currentUser.role);
  const isVendor = currentUser.role === "vendor";
  const draggingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (draggingRef.current) return;
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.draaiboeken) return;
    setDraaiboeken(data.draaiboeken);
    setActiveDraaiboekId(prev => (prev && data.draaiboeken.some((d: Draaiboek) => d.id === prev)) ? prev : (data.draaiboeken[0]?.id ?? null));
  }, [weddingId]);

  useEffect(() => {
    const interval = setInterval(refresh, 12000);
    function onFocus() { refresh(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  async function exportPdf() {
    if (!activeDraaiboekId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/export`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `draaiboek-${weddingTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function canEditItem(item: DraaiboekItem): boolean {
    if (isPlanner) return true;
    if (isVendor) return !!ownVendorId && item.vendorId === ownVendorId;
    return false;
  }

  async function createDraaiboek(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newDraaiboekTitle }),
    });
    const data = await res.json();
    if (data.draaiboek) {
      setDraaiboeken(prev => [{ ...data.draaiboek, items: [] }, ...prev]);
      setActiveDraaiboekId(data.draaiboek.id);
    }
    setNewDraaiboekTitle("");
    setShowNewDraaiboek(false);
    setSaving(false);
  }

  async function addItem(patch: Record<string, unknown>) {
    if (!activeDraaiboekId) return;
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, sortOrder: (activeDraaiboek?.items.length ?? 0) + 1 }),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken(prev =>
        prev.map(d => d.id === activeDraaiboekId
          ? { ...d, items: [...d.items, data.item].sort((a, b) => a.sortOrder - b.sortOrder) }
          : d)
      );
    }
  }

  async function updateItem(itemId: string, patch: Record<string, unknown>) {
    if (!activeDraaiboekId) return;
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items/${itemId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken(prev =>
        prev.map(d => d.id === activeDraaiboekId
          ? { ...d, items: d.items.map(i => i.id === itemId ? data.item : i).sort((a, b) => a.sortOrder - b.sortOrder) }
          : d)
      );
    }
  }

  async function deleteItem(itemId: string) {
    if (!activeDraaiboekId) return;
    await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items/${itemId}`, { method: "DELETE" });
    setDraaiboeken(prev =>
      prev.map(d => d.id === activeDraaiboekId
        ? { ...d, items: d.items.filter(i => i.id !== itemId) }
        : d)
    );
  }

  async function togglePublic(itemId: string, current: boolean) {
    if (!activeDraaiboekId) return;
    const res = await fetch(`/api/weddings/${weddingId}/draaiboek/${activeDraaiboekId}/items/${itemId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !current }),
    });
    const data = await res.json();
    if (data.item) {
      setDraaiboeken(prev =>
        prev.map(d => d.id === activeDraaiboekId
          ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, isPublic: data.item.isPublic } : i) }
          : d)
      );
    }
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/weddings/${weddingId}`} className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: "var(--muted)" }}>
          ← Terug naar {weddingTitle}
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif" style={{ fontSize: "clamp(1.375rem, 4vw, 1.875rem)", fontWeight: 700, letterSpacing: "-0.01em" }}>Draaiboek</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "2px" }}>{weddingTitle}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPdf} disabled={exporting || !activeDraaiboekId} className="ddp-btn-secondary">
              <Printer className="inline w-3.5 h-3.5 mr-1" />{exporting ? "Bezig…" : "Exporteren als pdf"}
            </button>
            {isPlanner && (
              <button onClick={() => setShowNewDraaiboek(!showNewDraaiboek)} className="ddp-btn-secondary">
                <Plus className="inline w-3.5 h-3.5 mr-1" />Nieuw draaiboek
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New draaiboek form */}
      {showNewDraaiboek && isPlanner && (
        <form onSubmit={createDraaiboek} className="ddp-card mb-5 flex gap-3">
          <input required value={newDraaiboekTitle} onChange={e => setNewDraaiboekTitle(e.target.value)}
            placeholder="Naam draaiboek (bijv. Draaiboek Trouwdag)" style={{ ...INPUT_STYLE, flex: 1 }} />
          <button type="submit" disabled={saving} className="ddp-btn-primary">Aanmaken</button>
        </form>
      )}

      {draaiboeken.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-rose)" }} />
          <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>Nog geen draaiboek</h2>
          <p className="text-sm mb-4">Maak een draaiboek aan om de tijdlijn van de trouwdag te plannen</p>
          {isPlanner && (
            <button onClick={() => setShowNewDraaiboek(true)} className="ddp-btn-primary">Draaiboek aanmaken</button>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: version picker */}
          <div style={{ width: "100%", maxWidth: "200px", flexShrink: 0 }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "0.75rem" }}>Versies</p>
            <div className="flex flex-col gap-1.5">
              {draaiboeken.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDraaiboekId(d.id)}
                  style={{
                    textAlign: "left", padding: "0.75rem 0.875rem", borderRadius: "12px",
                    border: "1px solid",
                    borderColor: activeDraaiboekId === d.id ? "var(--gold)" : "var(--border)",
                    background: activeDraaiboekId === d.id ? "var(--sand)" : "white",
                    cursor: "pointer",
                    transition: "background 140ms var(--ease-out), border-color 140ms var(--ease-out), transform 100ms var(--ease-out)",
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }} className="truncate">{d.title}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>v{d.version}</span>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: d.status === "final" ? "var(--gold-deep)" : "var(--muted-light)" }}>
                      {d.status === "final" ? "Definitief" : "Concept"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {activeDraaiboek && (
              <DraaiboekGrid
                items={activeDraaiboek.items}
                vendors={vendors}
                canEditItem={canEditItem}
                isPlanner={isPlanner}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onAddItem={addItem}
                onTogglePublic={togglePublic}
                onDragStateChange={dragging => { draggingRef.current = dragging; }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
