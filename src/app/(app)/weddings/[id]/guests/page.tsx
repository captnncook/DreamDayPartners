"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Upload } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";
import InfoTip from "@/components/InfoTip";

type Guest = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  side: string;
  rsvpStatus: string;
  dietary?: string;
  allergies?: string;
  plusOne: boolean;
  isChild: boolean;
};

const RSVP_LABELS: Record<string, string> = {
  confirmed: "Bevestigd", declined: "Afgemeld", invited: "Uitgenodigd", no_response: "Geen reactie",
};
const SIDE_LABELS: Record<string, string> = { bride: "Partner 1", groom: "Partner 2", both: "Beiden" };

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("all");
  const [form, setForm] = useState({ name: "", email: "", phone: "", side: "both", dietary: "", allergies: "", plusOne: false, isChild: false });
  const [saving, setSaving] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [rsvpToken, setRsvpToken] = useState<string | null>(null);
  const [rsvpCopied, setRsvpCopied] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/guests`);
    const data = await res.json();
    setGuests(data.guests ?? []);
    setRsvpToken(data.rsvpToken ?? null);
    setLoading(false);
  }, [id]);

  function copyRsvpLink() {
    if (!rsvpToken) return;
    const url = `${window.location.origin}/rsvp/${rsvpToken}`;
    navigator.clipboard.writeText(url).then(() => { setRsvpCopied(true); setTimeout(() => setRsvpCopied(false), 2000); });
  }

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent, confirmDuplicate = false) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/weddings/${id}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, confirmDuplicate }),
    });
    setSaving(false);
    if (res.status === 409) {
      const data = await res.json().catch(() => null);
      if (data?.error === "duplicate" && window.confirm(`${data.message} Toch nog een keer toevoegen?`)) {
        return handleAdd(e, true);
      }
      return;
    }
    setForm({ name: "", email: "", phone: "", side: "both", dietary: "", allergies: "", plusOne: false, isChild: false });
    setShowForm(false);
    load();
  }

  async function updateRsvp(guest: Guest, status: string) {
    await fetch(`/api/weddings/${id}/guests/${guest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...guest, rsvpStatus: status }),
    });
    load();
  }

  // Splitst één CSV-regel in kolommen, met respect voor aanhalingstekens
  // (zodat een naam of notitie met een komma erin — "Jansen, Marie" — niet
  // per ongeluk kolommen laat verschuiven).
  function splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(v => v.trim());
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvImporting(true);
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    const header = splitCsvLine(lines[0]).map(h => h.toLowerCase());
    const col = (row: string[], name: string) => {
      const i = header.indexOf(name);
      return i >= 0 ? (row[i] ?? "") : "";
    };
    const rows = lines.slice(1).filter(l => l.trim()).map(splitCsvLine);
    let imported = 0;
    const skipped: string[] = [];
    for (const row of rows) {
      const name = col(row, "naam") || col(row, "name");
      if (!name) { skipped.push(`(rij zonder naam)`); continue; }
      const res = await fetch(`/api/weddings/${id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: col(row, "email") || "",
          phone: col(row, "telefoon") || col(row, "phone") || "",
          side: col(row, "kant") || col(row, "side") || "both",
          dietary: col(row, "dieet") || col(row, "dietary") || "",
          allergies: col(row, "allergie") || col(row, "allergieën") || col(row, "allergie(en)") || col(row, "allergy") || col(row, "allergies") || "",
          plusOne: false,
          confirmDuplicate: true,
        }),
      });
      if (res.ok) imported++;
      else skipped.push(name);
    }
    if (csvRef.current) csvRef.current.value = "";
    setCsvImporting(false);
    load();
    if (skipped.length > 0) {
      alert(`${imported} gast(en) geïmporteerd, ${skipped.length} overgeslagen:\n${skipped.slice(0, 15).join(", ")}${skipped.length > 15 ? "…" : ""}`);
    } else {
      alert(`${imported} gast(en) geïmporteerd.`);
    }
  }

  async function deleteGuest(guestId: string) {
    if (!confirm("Gast verwijderen?")) return;
    await fetch(`/api/weddings/${id}/guests/${guestId}`, { method: "DELETE" });
    load();
  }

  const filtered = guests.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRsvp = filterRsvp === "all" || g.rsvpStatus === filterRsvp;
    return matchSearch && matchRsvp;
  });

  const stats = {
    confirmed: guests.filter((g) => g.rsvpStatus === "confirmed").length,
    declined: guests.filter((g) => g.rsvpStatus === "declined").length,
    invited: guests.filter((g) => g.rsvpStatus === "invited").length,
    no_response: guests.filter((g) => g.rsvpStatus === "no_response").length,
  };

  if (loading) return <div className="p-8 max-w-5xl mx-auto space-y-3">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i} rows={2}/>)}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Gastenlijst</h1>
          <div className="flex gap-2">
            <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" id="csv-import" />
            <label htmlFor="csv-import" className="ddp-btn-secondary cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />{csvImporting ? "Importeren…" : "CSV import"}
            </label>
            <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
              {showForm ? "Annuleren" : "+ Gast toevoegen"}
            </button>
          </div>
        </div>
      </div>

      {rsvpToken && (
        <div className="ddp-card mb-6 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-0.5" style={{ display: "flex", alignItems: "center" }}>
              Aanmeldlink voor gasten (RSVP)
              <InfoTip label="Wat betekent RSVP?" text="RSVP betekent: laten weten of je komt. Deel deze link met je gasten zodat zij kunnen aangeven of ze aanwezig zijn." />
            </p>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{typeof window !== "undefined" ? `${window.location.origin}/rsvp/${rsvpToken}` : `/rsvp/${rsvpToken}`}</p>
          </div>
          <button onClick={copyRsvpLink} className="ddp-btn-secondary flex-shrink-0 text-xs">
            {rsvpCopied ? "Gekopieerd!" : "Kopieer link"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-x-7 gap-y-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        {Object.entries(stats).map(([key, count]) => {
          const active = filterRsvp === key;
          return (
            <button key={key}
              onClick={() => setFilterRsvp(active ? "all" : key)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", opacity: filterRsvp !== "all" && !active ? 0.45 : 1 }}>
              <span className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: active ? "var(--gold-deep)" : "var(--foreground)", letterSpacing: "-0.01em" }}>{count}</span>
              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1px" }}>{RSVP_LABELS[key]}</span>
            </button>
          );
        })}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="ddp-card mb-6 space-y-4">
          <h3 className="font-semibold">Gast toevoegen</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Naam *</label>
              <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Volledige naam" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@voorbeeld.nl" className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Telefoon</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="06-..." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Kant</label>
              <select value={form.side} onChange={(e) => setForm((p) => ({ ...p, side: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                <option value="both">Beiden</option>
                <option value="bride">Partner 1</option>
                <option value="groom">Partner 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Dieetwensen</label>
              <input value={form.dietary} onChange={(e) => setForm((p) => ({ ...p, dietary: e.target.value }))}
                placeholder="Vegetarisch, vegan, etc." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Allergieën</label>
              <input value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
                placeholder="Pinda's, schaaldieren, etc." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: form.allergies.trim() ? "var(--gold-deep)" : "var(--border)" }} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="plusOne" checked={form.plusOne} onChange={(e) => setForm((p) => ({ ...p, plusOne: e.target.checked }))} />
              <label htmlFor="plusOne" className="text-sm">Plus één meenemen</label>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="isChild" checked={form.isChild} onChange={(e) => setForm((p) => ({ ...p, isChild: e.target.checked }))} />
              <label htmlFor="isChild" className="text-sm">Kind</label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="ddp-btn-primary w-full">
            {saving ? "Opslaan..." : "Gast toevoegen"}
          </button>
        </form>
      )}

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of e-mail..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
        <select value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
          <option value="all">Alle statussen</option>
          {Object.entries(RSVP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="ddp-scroll-fade ddp-scroll-fade--surface" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="w-full" style={{ minWidth: "640px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
              {["Naam", "Contact", "Kant", "Aanwezig", "Dieet", "Allergie", ""].map((h) => (
                <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest, i) => (
              <tr key={guest.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : undefined }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--gold)", color: "var(--ink)" }}>
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{guest.name}</div>
                      <div className="flex gap-1.5">
                        {guest.isChild && <span className="text-xs" style={{ color: "var(--muted)" }}>kind</span>}
                        {guest.plusOne && <span className="text-xs" style={{ color: "var(--muted)" }}>+1</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                  {guest.email && <div>{guest.email}</div>}
                  {guest.phone && <div>{guest.phone}</div>}
                </td>
                <td className="px-4 py-3 text-xs">{SIDE_LABELS[guest.side] ?? guest.side}</td>
                <td className="px-4 py-3">
                  <select value={guest.rsvpStatus} onChange={(e) => updateRsvp(guest, e.target.value)}
                    className="border rounded-md px-2 py-1 text-xs" style={{ borderColor: "var(--border)" }}>
                    {Object.entries(RSVP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{guest.dietary ?? ""}</td>
                <td className="px-4 py-3 text-xs" style={{ color: guest.allergies ? "var(--gold-deep)" : "var(--muted)", fontWeight: guest.allergies ? 700 : 400 }}>{guest.allergies ?? ""}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteGuest(guest.id)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}><X className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--muted)" }}>
            <p>Geen gasten gevonden</p>
          </div>
        )}
      </div>
      </div>
      <div className="text-xs mt-2 text-right" style={{ color: "var(--muted)" }}>
        {filtered.length} van {guests.length} gasten
      </div>
    </div>
  );
}
