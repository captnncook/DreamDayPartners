"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

type Invite = {
  id: string;
  email1: string;
  email2: string | null;
  weddingDate: string;
  weddingTitle: string | null;
  notes: string | null;
  weddingId: string | null;
  wedding: { id: string; title: string; date: string } | null;
  createdAt: string;
  source?: "invite" | "direct";
  vendorStatus?: string;
};

const VENDOR_STATUS_LABELS: Record<string, string> = {
  lead: "Interesse", confirmed: "Bevestigd", booked: "Geboekt", quote_received: "Offerte ontvangen",
  declined: "Afgewezen", ready: "Klaar voor de dag", in_progress: "In voorbereiding",
  invited: "Uitgenodigd", contacted: "Gecontacteerd", interest: "Interesse", completed: "Afgerond", pending: "In behandeling",
};
const VENDOR_STATUS_COLORS: Record<string, string> = {
  lead: "var(--gold-deep)", confirmed: "var(--gold-deep)", booked: "var(--gold-deep)", quote_received: "var(--foreground)",
  declined: "var(--muted-light)", interest: "var(--muted)", ready: "var(--gold-deep)", in_progress: "var(--foreground)",
  invited: "var(--muted)", contacted: "var(--muted)", completed: "var(--muted-light)", pending: "var(--muted)",
};

const INP: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem",
  border: "1px solid var(--border)", borderRadius: "10px",
  fontSize: "0.875rem", background: "white", outline: "none",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function MijnBruiloftenPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email1: "", email2: "", weddingDate: "", weddingTitle: "", notes: "" });
  const [vendorType, setVendorType] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    Promise.all([
      fetch("/api/vendor/weddings").then(r => r.json()),
      fetch("/api/me").then(r => r.json()),
    ]).then(([wData, meData]) => {
      clearTimeout(timeout);
      setInvites(wData.invites ?? []);
      setVendorType(meData.user?.vendorType ?? null);
    }).catch(() => { clearTimeout(timeout); }).finally(() => setLoading(false));
  }, []);

  const canRegisterWedding = vendorType === "weddingplanner";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/vendor/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Er is iets misgegaan");
    } else {
      setInvites(prev => [data.invite, ...prev]);
      setForm({ email1: "", email2: "", weddingDate: "", weddingTitle: "", notes: "" });
      setShowForm(false);
      setSuccess(data.matched
        ? "Bruiloft gevonden en direct gekoppeld aan een bestaand account!"
        : "Bruiloft aangemaakt. Je hebt nu meteen toegang tot het dashboard. Zodra het bruidspaar zich aanmeldt worden ze automatisch gekoppeld."
      );
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Registratie verwijderen?")) return;
    await fetch(`/api/vendor/weddings/${id}`, { method: "DELETE" });
    setInvites(prev => prev.filter(i => i.id !== id));
  }

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Mijn bruiloften</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "2px" }}>
            Registreer een bruiloft zodat je automatisch wordt gekoppeld zodra het bruidspaar aanmeldt.
          </p>
        </div>
        {canRegisterWedding && (
          <button
            onClick={() => { setShowForm(!showForm); setSuccess(""); }}
            className="ddp-btn-primary inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Bruiloft registreren
          </button>
        )}
      </div>

      {success && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "0 10px 10px 0", background: "var(--sand)", borderLeft: "3px solid var(--gold)", color: "var(--foreground)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="ddp-card mb-6" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Bruiloft registreren</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                E-mail partner 1 *<br />
                <input type="email" required value={form.email1} onChange={e => set("email1", e.target.value)} placeholder="partner1@email.nl" style={{ ...INP, marginTop: "0.3rem" }} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                E-mail partner 2<br />
                <input type="email" value={form.email2} onChange={e => set("email2", e.target.value)} placeholder="partner2@email.nl" style={{ ...INP, marginTop: "0.3rem" }} />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                Trouwdatum *<br />
                <input type="date" required value={form.weddingDate} onChange={e => set("weddingDate", e.target.value)} style={{ ...INP, marginTop: "0.3rem" }} />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                Naam bruiloft (optioneel)<br />
                <input value={form.weddingTitle} onChange={e => set("weddingTitle", e.target.value)} placeholder="bijv. Bruiloft Emma & Thomas" style={{ ...INP, marginTop: "0.3rem" }} />
              </label>
            </div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              Notities<br />
              <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Bijv. decoratie kerk + diner" style={{ ...INP, marginTop: "0.3rem" }} />
            </label>
            {error && <p style={{ fontSize: "0.875rem", color: "var(--danger)" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" disabled={saving} className="ddp-btn-primary">
                {saving ? "Opslaan…" : "Registreren"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="ddp-btn-secondary">Annuleren</button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Laden…</p>
      ) : invites.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Nog geen bruiloften geregistreerd</p>
          <p style={{ fontSize: "0.875rem" }}>Voeg een bruiloft toe om automatisch gekoppeld te worden zodra het bruidspaar zich aanmeldt.</p>
        </div>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {invites.map(invite => {
            const linked = !!invite.weddingId;
            return (
              <div key={invite.id} className="dash-row" style={{ cursor: linked ? "pointer" : "default", alignItems: "flex-start" }}
                onClick={() => { if (linked && invite.weddingId) window.location.href = `/weddings/${invite.weddingId}`; }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", width: "100%" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-serif" style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {invite.weddingTitle ?? formatDate(invite.weddingDate)}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "2px" }}>
                      {formatDate(invite.weddingDate)} · {invite.email1}{invite.email2 ? ` & ${invite.email2}` : ""}
                    </div>
                    {invite.notes && (
                      <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "4px" }}>{invite.notes}</div>
                    )}
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {linked ? (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>
                          Bruidspaar gekoppeld
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-light)" }}>
                          Bruidspaar nog niet aangemeld
                        </span>
                      )}
                      {invite.vendorStatus && (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: VENDOR_STATUS_COLORS[invite.vendorStatus] ?? "var(--muted)" }}>
                          {VENDOR_STATUS_LABELS[invite.vendorStatus] ?? invite.vendorStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                    {invite.weddingId && (
                      <Link
                        href={`/weddings/${invite.weddingId}`}
                        style={{ fontSize: "0.8125rem", color: "var(--gold-deep)", fontWeight: 600, textDecoration: "none" }}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button onClick={() => handleDelete(invite.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "4px", display: "flex" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
