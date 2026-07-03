"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Heart, Check } from "lucide-react";

type WeddingInfo = { id: string; title: string; date: string; venue?: string | null };

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rsvpStatus: "confirmed", dietary: "", plusOne: false });

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(d => { if (d.wedding) setWedding(d.wedding); else setNotFound(true); })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSubmitted(true);
  }

  const weddingDate = wedding ? new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.date)) : "";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background, #faf9f7)" }}>
      <p style={{ color: "#888" }}>Laden…</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background, #faf9f7)" }}>
      <p style={{ color: "#888" }}>Uitnodiging niet gevonden.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff5f7 0%, #faf9f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "white", borderRadius: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", padding: "2.5rem 2rem", textAlign: "center" }}>
        <Heart style={{ width: "2.5rem", height: "2.5rem", color: "#e05252", margin: "0 auto 1rem", fill: "#e05252" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{wedding?.title}</h1>
        <p style={{ color: "#888", marginBottom: "0.25rem", textTransform: "capitalize" }}>{weddingDate}</p>
        {wedding?.venue && <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "2rem" }}>{wedding.venue}</p>}

        {submitted ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Check style={{ width: "3rem", height: "3rem", color: "#22c55e", margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Bedankt!</h2>
            <p style={{ color: "#888", marginTop: "0.5rem" }}>Je aanmelding is ontvangen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Naam *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Jouw volledige naam"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.625rem 0.875rem", fontSize: "0.9rem", outline: "none" }} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>E-mailadres</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@voorbeeld.nl"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.625rem 0.875rem", fontSize: "0.9rem", outline: "none" }} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Aanwezigheid</label>
              <select value={form.rsvpStatus} onChange={e => setForm(p => ({ ...p, rsvpStatus: e.target.value }))}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.625rem 0.875rem", fontSize: "0.9rem", outline: "none", background: "white" }}>
                <option value="confirmed">Ik kom!</option>
                <option value="declined">Ik kan helaas niet</option>
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Dieetwensen</label>
              <input value={form.dietary} onChange={e => setForm(p => ({ ...p, dietary: e.target.value }))}
                placeholder="Vegetarisch, glutenvrij, etc."
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.625rem 0.875rem", fontSize: "0.9rem", outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <input type="checkbox" id="plusOne" checked={form.plusOne} onChange={e => setForm(p => ({ ...p, plusOne: e.target.checked }))}
                style={{ width: "1rem", height: "1rem" }} />
              <label htmlFor="plusOne" style={{ fontSize: "0.875rem" }}>Ik breng een partner mee (+1)</label>
            </div>
            <button type="submit" disabled={saving} className="ddp-btn-gold"
              style={{ width: "100%", background: "linear-gradient(135deg, #e8567a, #c4404f)", color: "white", border: "none", borderRadius: "12px", padding: "0.875rem", fontSize: "1rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Versturen…" : "RSVP versturen"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
