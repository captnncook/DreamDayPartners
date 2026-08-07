"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Check, Plus, X } from "lucide-react";

type WeddingInfo = { id: string; title: string; date: string; venue?: string | null };
type GuestRow = { name: string; isChild: boolean; dietary: string };

const EMPTY_GUEST: GuestRow = { name: "", isChild: false, dietary: "" };

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("confirmed");
  const [guests, setGuests] = useState<GuestRow[]>([{ ...EMPTY_GUEST }]);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(d => { if (d.wedding) setWedding(d.wedding); else setNotFound(true); })
      .finally(() => setLoading(false));
  }, [token]);

  function updateGuest(i: number, patch: Partial<GuestRow>) {
    setGuests(prev => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function addGuest() {
    setGuests(prev => [...prev, { ...EMPTY_GUEST }]);
  }
  function removeGuest(i: number) {
    setGuests(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        rsvpStatus,
        guests: rsvpStatus === "confirmed" ? guests.filter(g => g.name.trim()) : [],
      }),
    });
    setSaving(false);
    setSubmitted(true);
  }

  const weddingDate = wedding ? new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.date)) : "";

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem", border: "1px solid var(--border)",
    borderRadius: "10px", fontSize: "0.9rem", outline: "none", background: "white", color: "var(--foreground)",
    boxSizing: "border-box",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <p style={{ color: "var(--muted)" }}>Laden…</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <p style={{ color: "var(--muted)" }}>Uitnodiging niet gevonden.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "white", borderRadius: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(150deg, var(--ink) 0%, var(--ink-mid) 100%)", padding: "2rem 2rem 1.75rem", textAlign: "center" }}>
          <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink-text)", marginBottom: "0.375rem" }}>{wedding?.title}</h1>
          <p style={{ color: "var(--gold)", marginBottom: "0.125rem", textTransform: "capitalize", fontSize: "0.875rem", fontWeight: 600 }}>{weddingDate}</p>
          {wedding?.venue && <p style={{ color: "var(--ink-muted)", fontSize: "0.8125rem" }}>{wedding.venue}</p>}
        </div>

        <div style={{ padding: "2rem" }}>
          {submitted ? (
            <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
              <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Check style={{ width: "1.5rem", height: "1.5rem", color: "var(--gold-deep)" }} />
              </div>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>Bedankt!</h2>
              <p style={{ color: "var(--muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                {email ? "Je ontvangt zo een bevestiging per e-mail." : "Je reactie is ontvangen."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--foreground)" }}>E-mailadres</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voor een bevestiging per mail" style={INPUT} />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem", color: "var(--foreground)" }}>Aanwezigheid</label>
                <select value={rsvpStatus} onChange={e => setRsvpStatus(e.target.value)} style={{ ...INPUT, cursor: "pointer" }}>
                  <option value="confirmed">Ik kom!</option>
                  <option value="declined">Ik kan helaas niet</option>
                </select>
              </div>

              {rsvpStatus === "confirmed" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div className="ddp-section-label" style={{ marginBottom: "0.625rem" }}>Wie komen er?</div>
                  {guests.map((g, i) => (
                    <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "0.875rem", marginBottom: "0.625rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <input
                          value={g.name}
                          onChange={e => updateGuest(i, { name: e.target.value })}
                          placeholder={i === 0 ? "Jouw naam" : "Naam"}
                          style={{ ...INPUT, flex: 1 }}
                        />
                        {guests.length > 1 && (
                          <button type="button" onClick={() => removeGuest(i)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", padding: "0.25rem" }}>
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <select value={g.isChild ? "child" : "adult"} onChange={e => updateGuest(i, { isChild: e.target.value === "child" })}
                          style={{ ...INPUT, width: "auto", flexShrink: 0, cursor: "pointer" }}>
                          <option value="adult">Volwassene</option>
                          <option value="child">Kind</option>
                        </select>
                        <input
                          value={g.dietary}
                          onChange={e => updateGuest(i, { dietary: e.target.value })}
                          placeholder="Dieetwensen (optioneel)"
                          style={{ ...INPUT, flex: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addGuest}
                    className="inline-flex items-center gap-1.5"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold-deep)", fontSize: "0.8125rem", fontWeight: 600, padding: "0.25rem 0" }}>
                    <Plus className="w-3.5 h-3.5" /> Nog iemand toevoegen
                  </button>
                </div>
              )}

              <button type="submit" disabled={saving} className="ddp-btn-gold"
                style={{ width: "100%", background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "var(--radius-full)", padding: "0.875rem", fontSize: "1rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                {saving ? "Versturen…" : "RSVP versturen"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
