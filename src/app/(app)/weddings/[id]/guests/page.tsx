"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Guest = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  side: string;
  rsvpStatus: string;
  dietary?: string;
  plusOne: boolean;
};

const RSVP_COLORS: Record<string, string> = {
  confirmed: "badge-success", declined: "badge-danger", invited: "badge-info", no_response: "badge-neutral",
};
const RSVP_LABELS: Record<string, string> = {
  confirmed: "Bevestigd", declined: "Afgemeld", invited: "Uitgenodigd", no_response: "Geen reactie",
};
const SIDE_LABELS: Record<string, string> = { bride: "Bruid", groom: "Bruidegom", both: "Beiden" };

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("all");
  const [form, setForm] = useState({ name: "", email: "", phone: "", side: "both", dietary: "", plusOne: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${id}/guests`);
    const data = await res.json();
    setGuests(data.guests ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/weddings/${id}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", phone: "", side: "both", dietary: "", plusOne: false });
    setShowForm(false);
    setSaving(false);
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

  async function deleteGuest(guestId: string) {
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

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden...</div>;

  return (
    <div className="px-4 py-5 md:px-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm hover:underline" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Gastenlijst</h1>
          <button onClick={() => setShowForm(!showForm)} className="ddp-btn-primary">
            {showForm ? "Annuleren" : "+ Gast toevoegen"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(stats).map(([key, count]) => (
          <div key={key} className="ddp-card text-center p-3 cursor-pointer"
            onClick={() => setFilterRsvp(filterRsvp === key ? "all" : key)}
            style={{ border: filterRsvp === key ? "2px solid var(--primary)" : undefined }}>
            <div className="text-xl font-bold">{count}</div>
            <span className={`ddp-badge ${RSVP_COLORS[key]} mt-1`}>{RSVP_LABELS[key]}</span>
          </div>
        ))}
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
                <option value="bride">Bruid</option>
                <option value="groom">Bruidegom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Dieetwensen</label>
              <input value={form.dietary} onChange={(e) => setForm((p) => ({ ...p, dietary: e.target.value }))}
                placeholder="Vegetarisch, vegan, etc." className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="plusOne" checked={form.plusOne} onChange={(e) => setForm((p) => ({ ...p, plusOne: e.target.checked }))} />
              <label htmlFor="plusOne" className="text-sm">Plus één meenemen</label>
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

      <div className="ddp-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
              {["Naam", "Contact", "Kant", "RSVP", "Dieet", ""].map((h) => (
                <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest, i) => (
              <tr key={guest.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : undefined }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--primary)" }}>
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{guest.name}</div>
                      {guest.plusOne && <span className="text-xs" style={{ color: "var(--muted)" }}>+1</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                  {guest.email && <div>{guest.email}</div>}
                  {guest.phone && <div>{guest.phone}</div>}
                </td>
                <td className="px-4 py-3 text-xs">{SIDE_LABELS[guest.side]}</td>
                <td className="px-4 py-3">
                  <select value={guest.rsvpStatus} onChange={(e) => updateRsvp(guest, e.target.value)}
                    className="border rounded-md px-2 py-1 text-xs" style={{ borderColor: "var(--border)" }}>
                    {Object.entries(RSVP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{guest.dietary ?? "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteGuest(guest.id)} className="text-xs hover:opacity-70" style={{ color: "var(--muted)" }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--muted)" }}>
            <div className="text-3xl mb-2">👥</div>
            <p>Geen gasten gevonden</p>
          </div>
        )}
      </div>
      <div className="text-xs mt-2 text-right" style={{ color: "var(--muted)" }}>
        {filtered.length} van {guests.length} gasten
      </div>
    </div>
  );
}
