"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Globe, Phone, Mail, ArrowLeft, Check, ChevronDown, Heart, Pencil, User } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", catering: "Catering", bakker: "Bruidstaart & Bakker",
  dj: "DJ", liveband: "Liveband & Muziek", ceremoniespreker: "Ceremoniespreker",
  trouwlocatie: "Trouwlocatie", haarstylist: "Haar & Make-up", vervoer: "Vervoer",
  decoratie: "Decoratie & Styling", fotocabine: "Fotocabine", overig: "Overig",
};

type Vendor = {
  id: string; name: string; category: string; contactPerson?: string;
  email?: string; phone?: string; website?: string; description?: string;
  isPremium: boolean; photos: string[]; city?: string; userId?: string;
  priceFrom?: number; priceTo?: number; priceUnit?: string; specializations?: string[]; busyDates?: string[];
};
type Review = { id: string; rating: number; text?: string; createdAt: string; author: { name: string } };
type Wedding = { id: string; title: string; date: string };
type CurrentUser = { id: string; role: string; name: string };

export default function VendorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWedding, setSelectedWedding] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "", weddingDate: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimSending, setClaimSending] = useState(false);
  const [claimSent, setClaimSent] = useState(false);
  const [claimError, setClaimError] = useState("");

  const load = useCallback(async () => {
    const [vRes, meRes] = await Promise.all([
      fetch(`/api/catalogus/${id}`),
      fetch("/api/auth/me"),
    ]);
    const vData = await vRes.json();
    setVendor(vData.vendor ?? null);

    if (meRes.ok) {
      const meData = await meRes.json();
      setCurrentUser(meData.user ?? null);

      const [wRes, photosRes] = await Promise.all([
        meData.user ? fetch("/api/weddings") : Promise.resolve(null),
        fetch(`/api/catalogus/${id}/signed-photos`),
      ]);
      if (wRes) {
        const wData = await wRes.json();
        const ws = wData.weddings ?? [];
        setWeddings(ws);
        if (ws.length === 1) setSelectedWedding(ws[0].id);
      }
      const pData = await photosRes.json();
      setPhotoUrls(pData.urls ?? []);
      setCoverUrl(pData.coverUrl ?? null);
    } else {
      const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
      const pData = await photosRes.json();
      setPhotoUrls(pData.urls ?? []);
      setCoverUrl(pData.coverUrl ?? null);
    }
    const rRes = await fetch(`/api/catalogus/${id}/reviews`);
    if (rRes.ok) { const rData = await rRes.json(); setReviews(rData.reviews ?? []); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setContactSending(true);
    const res = await fetch(`/api/catalogus/${id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    });
    if (res.ok) setContactSent(true);
    setContactSending(false);
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaimSending(true);
    setClaimError("");
    const res = await fetch(`/api/catalogus/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: claimEmail }),
    });
    const data = await res.json();
    if (!res.ok) setClaimError(data.error ?? "Er ging iets mis");
    else setClaimSent(true);
    setClaimSending(false);
  }

  async function handleAddToDreamTeam() {
    if (!selectedWedding) return;
    setAdding(true);
    setAddError("");
    const res = await fetch(`/api/catalogus/${id}/dream-team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId: selectedWedding }),
    });
    const data = await res.json();
    if (!res.ok) setAddError(data.error ?? "Er ging iets mis");
    else setAdded(true);
    setAdding(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <p style={{ color: "var(--muted)" }}>Laden…</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>Leverancier niet gevonden.</p>
          <Link href="/leveranciers" className="ddp-btn-secondary">← Terug naar catalogus</Link>
        </div>
      </div>
    );
  }

  const isVendorOwner = currentUser?.id === vendor.userId;
  const isCouple = currentUser && !isVendorOwner && currentUser.role !== "vendor";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Photo header ─────────────────────────────── */}
      <div style={{ position: "relative", background: "var(--color-blush-soft)", borderBottom: "1px solid var(--border)" }}>
        {/* Logo linksboven + back link */}
        <div className="flex items-center justify-between" style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>
          <Link href="/leveranciers" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Alle leveranciers
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
            <Image src="/images/logo.svg" alt="" width={22} height={22} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
              DreamDay<span style={{ color: "var(--primary)" }}> Platform</span>
            </span>
          </Link>
        </div>

        {/* Photos: cover left + gallery right (like screenshot) */}
        {(coverUrl || photoUrls.length > 0) ? (
          <div style={{ maxWidth: "1040px", margin: "1.25rem auto 0", padding: "0 1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: photoUrls.length > 0 ? "1fr 1fr" : "1fr", gap: "4px", borderRadius: "var(--radius-lg)", overflow: "hidden", height: "380px" }}>
              {/* Cover / hoofdfoto */}
              <div style={{ position: "relative", height: "100%" }}>
                {coverUrl ? (
                  <Image src={coverUrl} alt={`${vendor.name}`} fill style={{ objectFit: "cover" }} />
                ) : photoUrls[0] ? (
                  <Image src={photoUrls[0]} alt={`${vendor.name}`} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", background: "var(--color-blush)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.4 }}>{vendor.category}</span>
                  </div>
                )}
                {photoUrls.length > 0 && (
                  <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "white", borderRadius: "8px", padding: "4px 10px", fontSize: "0.8125rem", fontWeight: 600 }}>
                    {photoUrls.length} foto&apos;s
                  </div>
                )}
              </div>
              {/* Gallery grid (up to 4 thumbnails) */}
              {photoUrls.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "4px", height: "100%" }}>
                  {(coverUrl ? photoUrls : photoUrls.slice(1)).slice(0, 4).map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <Image src={url} alt={`${vendor.name} foto ${i + 2}`} fill style={{ objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "1040px", margin: "1.25rem auto 0", padding: "0 1.25rem" }}>
            <div style={{ height: "220px", borderRadius: "var(--radius-lg)", background: "var(--color-blush)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.4 }}>{vendor.category}</span>
            </div>
          </div>
        )}

        {/* Vendor header info */}
        <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.5rem 1.25rem 2rem" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {vendor.isPremium && (
                <span className="ddp-badge badge-champagne mb-2" style={{ display: "inline-flex" }}>Aanbevolen leverancier</span>
              )}
              <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "0.375rem" }}>
                {vendor.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                <span>{CATEGORY_LABELS[vendor.category] ?? vendor.category}</span>
                {vendor.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {vendor.city}
                  </span>
                )}
              </div>
            </div>
            {isVendorOwner && (
              <Link href={`/leveranciers/${id}/bewerken`} className="ddp-btn-secondary flex items-center gap-1.5" style={{ flexShrink: 0 }}>
                <Pencil className="w-3.5 h-3.5" /> Profiel bewerken
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* About */}
            {vendor.description && (
              <div className="ddp-card mb-5">
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
                  Over {vendor.name}
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {vendor.description}
                </p>
              </div>
            )}

            {/* Price + specializations */}
            {(vendor.priceFrom || (vendor.specializations && vendor.specializations.length > 0)) && (
              <div className="ddp-card mb-5">
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>Diensten & prijzen</h2>
                {(vendor.priceFrom || vendor.priceTo) && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--muted)", display: "block", marginBottom: "0.25rem" }}>Prijsindicatie</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {vendor.priceFrom ? `€${vendor.priceFrom.toLocaleString("nl-NL")}` : ""}
                      {vendor.priceFrom && vendor.priceTo ? " – " : ""}
                      {vendor.priceTo ? `€${vendor.priceTo.toLocaleString("nl-NL")}` : ""}
                      {vendor.priceUnit && <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted)", marginLeft: "0.25rem" }}>{vendor.priceUnit}</span>}
                    </span>
                  </div>
                )}
                {vendor.specializations && vendor.specializations.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {vendor.specializations.map(s => (
                      <span key={s} style={{ background: "var(--color-blush-soft)", color: "var(--muted)", border: "1px solid var(--color-blush)", borderRadius: "9999px", padding: "0.25rem 0.75rem", fontSize: "0.8125rem" }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact */}
            <div className="ddp-card mb-5">
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                Contact
              </h2>
              <div className="flex flex-col gap-3">
                {vendor.contactPerson && (
                  <ContactRow icon={<User className="w-3.5 h-3.5" />} label={vendor.contactPerson} />
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Mail className="w-3.5 h-3.5" />} label={vendor.email} />
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Phone className="w-3.5 h-3.5" />} label={vendor.phone} />
                  </a>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Globe className="w-3.5 h-3.5" />} label={vendor.website.replace(/^https?:\/\//, "")} />
                  </a>
                )}
                {!vendor.contactPerson && !vendor.email && !vendor.phone && !vendor.website && (
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-light)" }}>Nog geen contactgegevens ingevuld.</p>
                )}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="ddp-card mb-5">
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
                  Beoordelingen
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.875rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "#f59e0b", fontSize: "0.9375rem", letterSpacing: "2px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{r.author.name}</span>
                      </div>
                      {r.text && <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>{r.text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claim profile */}
            {!vendor.userId && (
              <div className="ddp-card" style={{ background: "var(--color-blush-soft)", borderColor: "var(--color-blush)" }}>
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Is dit jouw bedrijf?</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Claim dit profiel om het te beheren, foto&apos;s toe te voegen en aanvragen van bruidsparen te ontvangen.
                </p>
                {claimSent ? (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#166534" }}>
                    Aanvraag verstuurd! We nemen je verzoek in behandeling en sturen je een e-mail zodra het is goedgekeurd.
                  </div>
                ) : (
                  <form onSubmit={handleClaim} style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="email"
                      required
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      placeholder="jouw@email.nl"
                      style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.875rem", boxSizing: "border-box" }}
                    />
                    <button type="submit" disabled={claimSending} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {claimSending ? "Bezig…" : "Profiel claimen"}
                    </button>
                  </form>
                )}
                {claimError && <p style={{ fontSize: "0.8125rem", color: "var(--danger)", marginTop: "0.5rem" }}>{claimError}</p>}
              </div>
            )}

            {/* Contact form */}
            {!isVendorOwner && (
              <div className="ddp-card">
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Stuur een aanvraag</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Stel een vraag of doe een vrijblijvende aanvraag bij {vendor.name}.
                </p>
                {contactSent ? (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#166534" }}>
                    Aanvraag verstuurd! {vendor.name} neemt zo snel mogelijk contact op.
                  </div>
                ) : (
                  <form onSubmit={handleContact} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      { key: "name", label: "Naam", placeholder: "Jouw naam", type: "text" },
                      { key: "email", label: "E-mailadres", placeholder: "jouw@email.nl", type: "email" },
                      { key: "phone", label: "Telefoonnummer (optioneel)", placeholder: "+31 6 12345678", type: "tel" },
                      { key: "weddingDate", label: "Trouwdatum (optioneel)", placeholder: "", type: "date" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: "0.8125rem", color: "var(--muted)", display: "block", marginBottom: "0.25rem" }}>{f.label}</label>
                        <input
                          type={f.type}
                          required={f.key === "name" || f.key === "email"}
                          value={contactForm[f.key as keyof typeof contactForm]}
                          onChange={e => setContactForm(c => ({ ...c, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.875rem", boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: "0.8125rem", color: "var(--muted)", display: "block", marginBottom: "0.25rem" }}>Bericht</label>
                      <textarea
                        required
                        value={contactForm.message}
                        onChange={e => setContactForm(c => ({ ...c, message: e.target.value }))}
                        placeholder="Vertel meer over jullie bruiloft en wat je nodig hebt…"
                        rows={4}
                        style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }}
                      />
                    </div>
                    <button type="submit" disabled={contactSending} style={{ padding: "0.625rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                      {contactSending ? "Verzenden…" : "Aanvraag versturen"}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Sidebar — Dream Team */}
          <div style={{ width: "100%", maxWidth: "300px", flexShrink: 0 }} className="lg:flex-shrink-0">
            <div className="ddp-card" style={{ background: "var(--color-blush-soft)", borderColor: "var(--color-blush)" }}>
              <Heart className="w-5 h-5 mb-3" style={{ color: "var(--color-rose)" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
                Toevoegen aan Dream Team
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Nodig {vendor.name} uit voor jullie bruiloft. De leverancier ontvangt een verzoek en kan dit accepteren.
              </p>

              {!currentUser ? (
                <div className="flex flex-col gap-2">
                  <Link href="/aanmelden" className="ddp-btn-primary" style={{ justifyContent: "center" }}>
                    Account aanmaken
                  </Link>
                  <Link href="/login" className="ddp-btn-secondary" style={{ justifyContent: "center" }}>
                    Inloggen
                  </Link>
                </div>
              ) : isVendorOwner ? (
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Dit is jouw eigen profiel.</p>
              ) : added ? (
                <div className="flex items-center gap-2" style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: 600 }}>
                  <Check className="w-4 h-4" /> Uitnodiging verstuurd!
                </div>
              ) : isCouple ? (
                <div className="flex flex-col gap-2.5">
                  {weddings.length > 1 && (
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedWedding}
                        onChange={(e) => setSelectedWedding(e.target.value)}
                        className="ddp-select appearance-none pr-8"
                        style={{ background: "white" }}
                      >
                        <option value="">Kies bruiloft…</option>
                        {weddings.map((w) => (
                          <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4" style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                    </div>
                  )}
                  {addError && <p style={{ fontSize: "0.8125rem", color: "var(--danger)" }}>{addError}</p>}
                  <button
                    onClick={handleAddToDreamTeam}
                    disabled={adding || !selectedWedding}
                    className="ddp-btn-primary"
                    style={{ justifyContent: "center" }}
                  >
                    {adding ? "Bezig…" : "Uitnodigen voor Dream Team"}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  Alleen bruidsparen kunnen leveranciers toevoegen.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3" style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--color-blush-soft)", border: "1px solid var(--color-blush)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--muted)" }}>
        {typeof icon === "string" ? icon : icon}
      </div>
      <span style={{ color: "var(--muted)" }}>{label}</span>
    </div>
  );
}
