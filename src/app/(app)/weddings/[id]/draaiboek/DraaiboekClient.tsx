"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Plus, Printer } from "lucide-react";
import DraaiboekGrid, { type GridItem, type WeddingVendorRef } from "./DraaiboekGrid";
import { eachDay, sameDay } from "@/lib/dateRange";

type DraaiboekItem = GridItem;

type Draaiboek = {
  id: string;
  title: string;
  date?: string | null; // de dag waarvoor dit draaiboek geldt (meerdaags)
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
  weddingEndDate?: string | null;
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
  weddingId, weddingTitle, weddingDate, weddingEndDate, draaiboeken: initial, vendors, currentUser, ownVendorId,
}: Props) {
  // Meerdaagse bruiloft: één tab per dag; elk draaiboek hoort bij één dag.
  // Draaiboeken zonder datum (van vóór deze feature) horen bij dag 1.
  const days = useMemo(() => eachDay(new Date(weddingDate), new Date(weddingEndDate ?? weddingDate)), [weddingDate, weddingEndDate]);
  const isMultiDay = days.length > 1;
  const dayIndexOf = useCallback((d: Draaiboek) => {
    if (!d.date) return 0;
    const date = new Date(d.date);
    const idx = days.findIndex(day => sameDay(day, date));
    return idx === -1 ? 0 : idx;
  }, [days]);

  const [draaiboeken, setDraaiboeken] = useState<Draaiboek[]>(initial);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeDraaiboekId, setActiveDraaiboekId] = useState<string | null>(() => {
    if (days.length <= 1) return initial[0]?.id ?? null;
    const firstOfDay1 = initial.find(d => !d.date || sameDay(days[0], new Date(d.date)));
    return firstOfDay1?.id ?? null;
  });
  const [showNewDraaiboek, setShowNewDraaiboek] = useState(false);
  const [newDraaiboekTitle, setNewDraaiboekTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [endDateDraft, setEndDateDraft] = useState(weddingEndDate ? weddingEndDate.split("T")[0] : "");
  const [savingEndDate, setSavingEndDate] = useState(false);

  // Einddatum instellen/aanpassen (meerdaagse bruiloft) — kan ook later nog.
  async function saveEndDate(clear = false) {
    setSavingEndDate(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate: clear ? null : endDateDraft || null }),
      });
      if (res.ok) {
        setShowDateEditor(false);
        router.refresh();
      }
    } finally {
      setSavingEndDate(false);
    }
  }
  const activeDraaiboek = draaiboeken.find(d => d.id === activeDraaiboekId);
  const isPlanner = ["admin", "planner", "team_member", "couple"].includes(currentUser.role);
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
      body: JSON.stringify({ title: newDraaiboekTitle, date: isMultiDay ? days[activeDayIndex].toISOString() : null }),
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

  const visibleDraaiboeken = isMultiDay
    ? draaiboeken.filter(d => dayIndexOf(d) === activeDayIndex)
    : draaiboeken;

  function switchDay(idx: number) {
    setActiveDayIndex(idx);
    const first = draaiboeken.find(d => dayIndexOf(d) === idx);
    setActiveDraaiboekId(first?.id ?? null);
    setShowNewDraaiboek(false);
  }

  const dayLabel = (d: Date) =>
    new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" }).format(d);

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

      {/* Einddatum instellen/aanpassen — alleen voor het team van de bruiloft */}
      {isPlanner && (
        <div className="mb-4">
          {showDateEditor ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={endDateDraft}
                min={weddingDate.split("T")[0]}
                onChange={e => setEndDateDraft(e.target.value)}
                style={{ ...INPUT_STYLE, width: "auto" }}
              />
              <button onClick={() => saveEndDate(false)} disabled={savingEndDate || !endDateDraft} className="ddp-btn-primary" style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
                {savingEndDate ? "Opslaan…" : "Opslaan"}
              </button>
              {isMultiDay && (
                <button onClick={() => saveEndDate(true)} disabled={savingEndDate} className="text-xs" style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Terug naar eendaags
                </button>
              )}
              <button onClick={() => setShowDateEditor(false)} className="text-xs" style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
                Annuleren
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDateEditor(true)} className="text-xs" style={{ color: "var(--gold-deep)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {isMultiDay ? "Einddatum aanpassen" : "Meerdaagse bruiloft? Einddatum toevoegen"}
            </button>
          )}
        </div>
      )}

      {/* Dag-tabs (meerdaagse bruiloft) */}
      {isMultiDay && (
        <div className="flex gap-2 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {days.map((day, idx) => {
            const active = idx === activeDayIndex;
            return (
              <button
                key={idx}
                onClick={() => switchDay(idx)}
                className="flex-shrink-0 px-4 py-2 rounded-full font-medium whitespace-nowrap"
                style={{
                  fontSize: "0.8125rem",
                  background: active ? "var(--ink)" : "rgba(0,0,0,0.05)",
                  color: active ? "white" : "var(--muted)",
                  border: "none", cursor: "pointer",
                  transition: "background 180ms var(--ease-out), color 180ms var(--ease-out)",
                }}
              >
                Dag {idx + 1} · {dayLabel(day)}
              </button>
            );
          })}
        </div>
      )}

      {/* New draaiboek form */}
      {showNewDraaiboek && isPlanner && (
        <form onSubmit={createDraaiboek} className="ddp-card mb-5 flex gap-3">
          <input required value={newDraaiboekTitle} onChange={e => setNewDraaiboekTitle(e.target.value)}
            placeholder="Naam draaiboek (bijv. Draaiboek Trouwdag)" style={{ ...INPUT_STYLE, flex: 1 }} />
          <button type="submit" disabled={saving} className="ddp-btn-primary">Aanmaken</button>
        </form>
      )}

      {visibleDraaiboeken.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-rose)" }} />
          <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>
            {isMultiDay ? `Nog geen draaiboek voor dag ${activeDayIndex + 1}` : "Nog geen draaiboek"}
          </h2>
          <p className="text-sm mb-4">
            {isMultiDay
              ? `Maak een draaiboek aan voor ${dayLabel(days[activeDayIndex])}`
              : "Maak een draaiboek aan om de tijdlijn van de trouwdag te plannen"}
          </p>
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
              {visibleDraaiboeken.map(d => (
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
