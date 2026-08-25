"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import InfoTip from "@/components/InfoTip";

type WeddingInfo = { id: string; title: string; date: string; venue?: string | null };
type GuestRow = { name: string; isChild: boolean; dietary: string; allergies: string };

const EMPTY_GUEST: GuestRow = { name: "", isChild: false, dietary: "", allergies: "" };

type Lang = "nl" | "en";

const STRINGS: Record<Lang, Record<string, string>> = {
  nl: {
    email: "E-mailadres",
    emailPlaceholder: "voor je bevestiging per mail",
    attendance: "Aanwezigheid",
    yourName: "Jouw naam",
    guestName: "Naam",
    coming: "Ik kom!",
    notComing: "Ik kan helaas niet",
    whoComes: "Wie komen er?",
    adult: "Volwassene",
    child: "Kind",
    dietary: "Dieetwensen (optioneel)",
    allergies: "Allergieën (optioneel)",
    allergiesHint: "Bijv. pinda's, schaaldieren, noten — dit gaat rechtstreeks naar de cateraar.",
    addGuest: "Nog iemand toevoegen",
    submit: "RSVP versturen",
    rsvpTip: "RSVP betekent: laten weten of je komt.",
    submitting: "Versturen…",
    thanks: "Bedankt!",
    confirmedThanks: "Je ontvangt zo een bevestiging per e-mail op",
    notFound: "Uitnodiging niet gevonden.",
    loading: "Laden…",
  },
  en: {
    email: "Email address",
    emailPlaceholder: "for your confirmation email",
    attendance: "Attendance",
    yourName: "Your name",
    guestName: "Name",
    coming: "I'll be there!",
    notComing: "Sorry, I can't make it",
    whoComes: "Who's coming?",
    adult: "Adult",
    child: "Child",
    dietary: "Dietary preferences (optional)",
    allergies: "Allergies (optional)",
    allergiesHint: "E.g. peanuts, shellfish, tree nuts — this goes straight to the caterer.",
    addGuest: "Add someone else",
    submit: "Send RSVP",
    rsvpTip: "RSVP means: let us know if you're coming.",
    submitting: "Sending…",
    thanks: "Thank you!",
    confirmedThanks: "You'll receive a confirmation email at",
    notFound: "Invitation not found.",
    loading: "Loading…",
  },
};

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
  const [lang, setLang] = useState<Lang>("nl");
  const t = STRINGS[lang];

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
    if (!email.trim() || !guests[0]?.name.trim()) return;
    setSaving(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        rsvpStatus,
        // Ook bij een afmelding sturen we de naam van de indiener mee — anders
        // belandt die als anoniem "Gast" in de lijst en kan het bruidspaar niet
        // zien wie precies heeft afgezegd zonder het e-mailadres op te zoeken.
        guests: rsvpStatus === "confirmed" ? guests.filter(g => g.name.trim()) : [guests[0]].filter(g => g.name.trim()),
      }),
    });
    setSaving(false);
    setSubmitted(true);
  }

  const weddingDate = wedding ? new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.date)) : "";

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem", border: "1px solid var(--border)",
    borderRadius: "10px", fontSize: "0.9rem", background: "white", color: "var(--foreground)",
    boxSizing: "border-box",
  };

  const LangToggle = (
    <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", gap: "2px", background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-full)", padding: "2px" }}>
      {(["nl", "en"] as Lang[]).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-label={l === "nl" ? "Nederlands" : "English"}
          aria-pressed={lang === l}
          style={{
            padding: "0.25rem 0.625rem", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
            fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase",
            background: lang === l ? "var(--gold)" : "transparent",
            color: lang === l ? "var(--ink)" : "var(--ink-muted)",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <p style={{ color: "var(--muted)" }}>{t.loading}</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <p style={{ color: "var(--muted)" }}>{t.notFound}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "white", borderRadius: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ position: "relative", background: "linear-gradient(150deg, var(--ink) 0%, var(--ink-mid) 100%)", padding: "2rem 2rem 1.75rem", textAlign: "center" }}>
          {LangToggle}
          <h1 className="font-serif" style={{ fontSize: "var(--text-5xl)", fontWeight: 700, color: "var(--ink-text)", marginBottom: "var(--space-2)" }}>{wedding?.title}</h1>
          <p style={{ color: "var(--gold)", marginBottom: "0.125rem", textTransform: "capitalize", fontSize: "var(--text-md)", fontWeight: 600 }}>{weddingDate}</p>
          {wedding?.venue && <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-base)" }}>{wedding.venue}</p>}
        </div>

        <div style={{ padding: "2rem" }}>
          {submitted ? (
            <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
              <h2 className="font-serif" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--foreground)" }}>{t.thanks}</h2>
              <p style={{ color: "var(--muted)", marginTop: "var(--space-3)", fontSize: "0.9rem" }}>
                {t.confirmedThanks} {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="rsvp-email" style={{ display: "block", fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
                  {t.email} <span style={{ color: "var(--gold-deep)" }}>*</span>
                </label>
                <input id="rsvp-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder} style={INPUT} />
              </div>

              <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="rsvp-name" style={{ display: "block", fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
                  {t.yourName} <span style={{ color: "var(--gold-deep)" }}>*</span>
                </label>
                <input id="rsvp-name" required value={guests[0]?.name ?? ""} onChange={e => updateGuest(0, { name: e.target.value })}
                  placeholder={t.yourName} style={INPUT} />
              </div>

              <div style={{ marginBottom: "var(--space-7)" }}>
                <label htmlFor="rsvp-status" style={{ display: "flex", alignItems: "center", fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
                  {t.attendance} (RSVP)
                  <InfoTip label={t.rsvpTip} text={t.rsvpTip} />
                </label>
                <select id="rsvp-status" value={rsvpStatus} onChange={e => setRsvpStatus(e.target.value)} style={{ ...INPUT, cursor: "pointer" }}>
                  <option value="confirmed">✓ {t.coming}</option>
                  <option value="declined">✕ {t.notComing}</option>
                </select>
              </div>

              {rsvpStatus === "confirmed" && (
                <div style={{ marginBottom: "var(--space-8)" }}>
                  <div className="ddp-section-label" style={{ marginBottom: "var(--space-4)" }}>{t.whoComes}</div>
                  {guests.map((g, i) => (
                    <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "0.875rem", marginBottom: "var(--space-4)" }}>
                      {i > 0 && (
                        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                          <input
                            value={g.name}
                            onChange={e => updateGuest(i, { name: e.target.value })}
                            placeholder={t.guestName}
                            aria-label={`${t.guestName} ${i + 1}`}
                            style={{ ...INPUT, flex: 1 }}
                          />
                          <button type="button" onClick={() => removeGuest(i)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", padding: "0.25rem" }}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
                        <select value={g.isChild ? "child" : "adult"} onChange={e => updateGuest(i, { isChild: e.target.value === "child" })}
                          aria-label={`${i === 0 ? t.yourName : t.guestName + " " + (i + 1)}: ${t.adult}/${t.child}`}
                          style={{ ...INPUT, width: "auto", flexShrink: 0, cursor: "pointer" }}>
                          <option value="adult">{t.adult}</option>
                          <option value="child">{t.child}</option>
                        </select>
                        <input
                          value={g.dietary}
                          onChange={e => updateGuest(i, { dietary: e.target.value })}
                          placeholder={t.dietary}
                          aria-label={`${t.dietary}, ${i === 0 ? t.yourName : t.guestName + " " + (i + 1)}`}
                          style={{ ...INPUT, flex: 1, minWidth: "180px" }}
                        />
                      </div>
                      <div>
                        <input
                          value={g.allergies}
                          onChange={e => updateGuest(i, { allergies: e.target.value })}
                          placeholder={t.allergies}
                          aria-label={`${t.allergies}, ${i === 0 ? t.yourName : t.guestName + " " + (i + 1)}`}
                          style={{ ...INPUT, borderColor: g.allergies.trim() ? "var(--gold-deep)" : "var(--border)" }}
                        />
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--muted)", marginTop: "var(--space-1)" }}>{t.allergiesHint}</p>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addGuest}
                    className="inline-flex items-center gap-1.5"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gold-deep)", fontSize: "var(--text-base)", fontWeight: 600, padding: "0.25rem 0" }}>
                    <Plus className="w-3.5 h-3.5" /> {t.addGuest}
                  </button>
                </div>
              )}

              <button type="submit" disabled={saving} className="ddp-btn-gold"
                style={{ width: "100%", background: "var(--gold)", color: "var(--ink)", border: "none", borderRadius: "var(--radius-full)", padding: "0.875rem", fontSize: "var(--text-xl)", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                {saving ? t.submitting : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
