"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle, Clock, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/vendor/weddings")
      .then(r => r.json())
      .then(d => setInvites(d.invites ?? []))
      .finally(() => setLoading(false));
  }, []);

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
        ? "✓ Bruiloft geregistreerd en direct gekoppeld — het bruidspaar heeft al een account!"
        : "✓ Bruiloft geregistreerd. Zodra het bruidspaar zich aanmeldt worden jullie automatisch gekoppeld."
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
          <h1 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.04em" }}>Mijn bruiloften</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "2px" }}>
            Registreer een bruiloft zodat je automatisch wordt gekoppeld zodra het bruidspaar aanmeldt.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSuccess(""); }}
          className="ddp-btn-primary inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Bruiloft registreren
        </button>
      </div>

      {success && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "0.875rem", marginBottom: "1rem" }}>
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
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--color-rose)" }} />
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Nog geen bruiloften geregistreerd</p>
          <p style={{ fontSize: "0.875rem" }}>Voeg een bruiloft toe om automatisch gekoppeld te worden zodra het bruidspaar zich aanmeldt.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {invites.map(invite => {
            const linked = !!invite.weddingId;
            return (
              <div key={invite.id} className="ddp-card" style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ marginTop: "2px" }}>
                    {linked
                      ? <CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} />
                      : <Clock className="w-5 h-5" style={{ color: "var(--muted-light)" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                      {invite.weddingTitle ?? formatDate(invite.weddingDate)}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "2px" }}>
                      {formatDate(invite.weddingDate)} · {invite.email1}{invite.email2 ? ` & ${invite.email2}` : ""}
                    </div>
                    {invite.notes && (
                      <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "4px" }}>{invite.notes}</div>
                    )}
                    <div style={{ marginTop: "6px" }}>
                      {linked ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                          <CheckCircle className="w-3 h-3" /> Gekoppeld
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", background: "var(--border)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                          Wacht op bruidspaar
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                    {invite.wedding && (
                      <Link
                        href={`/weddings/${invite.wedding.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open
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
