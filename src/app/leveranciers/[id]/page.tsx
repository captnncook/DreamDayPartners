"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Globe, Phone, Mail, ArrowLeft, Check, ChevronDown, Pencil, User } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", catering: "Catering", bakker: "Bruidstaart & Bakker",
  dj: "DJ", liveband: "Liveband & Muziek", ceremoniespreker: "Ceremoniespreker",
  trouwlocatie: "Trouwlocatie", haarstylist: "Haar & Make-up", vervoer: "Vervoer",
  decoratie: "Decoratie & Styling", fotocabine: "Fotocabine", overig: "Overig",
};

type VenueRoom = {
  id: string; name: string; surfaceArea?: number | null; ceilingHeight?: number | null;
  ceremonyMin?: number | null; ceremonyMax?: number | null;
  receptionMin?: number | null; receptionMax?: number | null;
  dinnerMin?: number | null; dinnerMax?: number | null;
  partyMin?: number | null; partyMax?: number | null;
};

type Vendor = {
  id: string; name: string; category: string; contactPerson?: string;
  email?: string; phone?: string; website?: string; description?: string;
  isPremium: boolean; photos: string[]; city?: string; userId?: string;
  priceFrom?: number; priceTo?: number; priceUnit?: string; specializations?: string[]; busyDates?: string[];
  averageWeddingPrice?: number | null;
  ceremonyMinGuests?: number | null; ceremonyMaxGuests?: number | null;
  receptionMinGuests?: number | null; receptionMaxGuests?: number | null;
  dinnerMinGuests?: number | null; dinnerMaxGuests?: number | null;
  partyMinGuests?: number | null; partyMaxGuests?: number | null;
  hotelRooms?: number | null;
  closingTime?: string | null; soundLimit?: string | null;
  isOfficialCeremonyLocation?: boolean; outdoorCeremonyPossible?: boolean;
  accessibility?: string[]; venueFacilities?: string[]; cateringOptions?: string[];
  barOptions?: string[]; environment?: string[];
  venueRooms?: VenueRoom[];
};

function GuestRange({ label, min, max }: { label: string; min?: number | null; max?: number | null }) {
  if (min == null && max == null) return null;
  return (
    <div>
      <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>{label}</span>
      <span className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>
        {min != null && max != null ? `${min} – ${max}` : min != null ? `vanaf ${min}` : `tot ${max}`}
      </span>
    </div>
  );
}
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
      <div style={{ position: "relative" }}>
        {/* Logo linksboven + back link */}
        <div className="flex items-center justify-between" style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>
          <Link href="/leveranciers" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Alle leveranciers
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
            <Image src="/images/logo.svg" alt="" width={22} height={22} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
              DreamDay<span className="font-serif" style={{ color: "var(--gold-deep)" }}> Platform</span>
            </span>
          </Link>
        </div>

        {/* Photos: cover left + gallery right */}
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
                  <div style={{ height: "100%", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.5 }}>{vendor.category}</span>
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
            <div style={{ height: "220px", borderRadius: "var(--radius-lg)", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", opacity: 0.5 }}>{vendor.category}</span>
            </div>
          </div>
        )}

        {/* Vendor header info */}
        <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.5rem 1.25rem 2rem" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {vendor.isPremium && (
                <span className="mb-2" style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-deep)" }}>Aanbevolen leverancier</span>
              )}
              <h1 className="font-serif" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "0.375rem" }}>
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
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 1.25rem 4rem" }}>
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* About */}
            {vendor.description && (
              <section className="mb-8">
                <h2 className="dash-section-title mb-2">Over {vendor.name}</h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {vendor.description}
                </p>
              </section>
            )}

            {/* Price + specializations */}
            {(vendor.priceFrom || vendor.averageWeddingPrice != null || (vendor.specializations && vendor.specializations.length > 0)) && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Diensten & prijzen</h2>
                {(vendor.priceFrom || vendor.priceTo) && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>Prijsindicatie</span>
                    <span className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {vendor.priceFrom ? `€${vendor.priceFrom.toLocaleString("nl-NL")}` : ""}
                      {vendor.priceFrom && vendor.priceTo ? " – " : ""}
                      {vendor.priceTo ? `€${vendor.priceTo.toLocaleString("nl-NL")}` : ""}
                      {vendor.priceUnit && <span className="font-sans" style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted)", marginLeft: "0.375rem" }}>{vendor.priceUnit}</span>}
                    </span>
                  </div>
                )}
                {vendor.averageWeddingPrice != null && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>Gemiddelde bruiloft</span>
                    <span className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>
                      €{vendor.averageWeddingPrice.toLocaleString("nl-NL")}
                    </span>
                  </div>
                )}
                {vendor.specializations && vendor.specializations.length > 0 && (
                  <p style={{ fontSize: "0.875rem", color: "var(--gold-deep)", fontWeight: 600 }}>
                    {vendor.specializations.join(" · ")}
                  </p>
                )}
              </section>
            )}

            {/* Capaciteit (alleen trouwlocaties) */}
            {vendor.category === "trouwlocatie" && (
              vendor.ceremonyMinGuests != null || vendor.ceremonyMaxGuests != null ||
              vendor.receptionMinGuests != null || vendor.receptionMaxGuests != null ||
              vendor.dinnerMinGuests != null || vendor.dinnerMaxGuests != null ||
              vendor.partyMinGuests != null || vendor.partyMaxGuests != null ||
              vendor.hotelRooms != null
            ) && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Capaciteit</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <GuestRange label="Ceremonie" min={vendor.ceremonyMinGuests} max={vendor.ceremonyMaxGuests} />
                  <GuestRange label="Receptie" min={vendor.receptionMinGuests} max={vendor.receptionMaxGuests} />
                  <GuestRange label="Diner" min={vendor.dinnerMinGuests} max={vendor.dinnerMaxGuests} />
                  <GuestRange label="Feest" min={vendor.partyMinGuests} max={vendor.partyMaxGuests} />
                </div>
                {vendor.hotelRooms != null && (
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                    <strong style={{ color: "var(--foreground)" }}>{vendor.hotelRooms}</strong> hotelkamers beschikbaar
                  </p>
                )}
              </section>
            )}

            {/* Zalen (alleen trouwlocaties) */}
            {vendor.category === "trouwlocatie" && vendor.venueRooms && vendor.venueRooms.length > 0 && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Zaalindeling</h2>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ textAlign: "left", padding: "0.5rem 0.5rem 0.5rem 0", color: "var(--muted)", fontWeight: 600 }}>Zaal</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Opp.</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Hoogte</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Ceremonie</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Receptie</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Diner</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--muted)", fontWeight: 600 }}>Feest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendor.venueRooms.map((room) => (
                        <tr key={room.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.625rem 0.5rem 0.625rem 0", fontWeight: 700, color: "var(--foreground)" }}>{room.name}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.surfaceArea != null ? `${room.surfaceArea}m²` : "–"}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.ceilingHeight != null ? `${room.ceilingHeight}m` : "–"}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.ceremonyMin != null || room.ceremonyMax != null ? `${room.ceremonyMin ?? "–"} - ${room.ceremonyMax ?? "–"}` : "–"}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.receptionMin != null || room.receptionMax != null ? `${room.receptionMin ?? "–"} - ${room.receptionMax ?? "–"}` : "–"}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.dinnerMin != null || room.dinnerMax != null ? `${room.dinnerMin ?? "–"} - ${room.dinnerMax ?? "–"}` : "–"}</td>
                          <td style={{ padding: "0.625rem 0.5rem", color: "var(--muted)" }}>{room.partyMin != null || room.partyMax != null ? `${room.partyMin ?? "–"} - ${room.partyMax ?? "–"}` : "–"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Eigenschappen (alleen trouwlocaties) */}
            {vendor.category === "trouwlocatie" && (
              vendor.isOfficialCeremonyLocation || vendor.outdoorCeremonyPossible ||
              (vendor.accessibility && vendor.accessibility.length > 0) ||
              (vendor.venueFacilities && vendor.venueFacilities.length > 0) ||
              (vendor.cateringOptions && vendor.cateringOptions.length > 0) ||
              (vendor.barOptions && vendor.barOptions.length > 0) ||
              (vendor.environment && vendor.environment.length > 0)
            ) && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Eigenschappen</h2>

                {(vendor.isOfficialCeremonyLocation || vendor.outdoorCeremonyPossible) && (
                  <p style={{ fontSize: "0.875rem", color: "var(--gold-deep)", fontWeight: 600, marginBottom: "0.75rem" }}>
                    {[
                      vendor.isOfficialCeremonyLocation && "Officiële trouwlocatie",
                      vendor.outdoorCeremonyPossible && "Buiten trouwen mogelijk",
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}

                {[
                  ["Toegankelijkheid", vendor.accessibility],
                  ["Faciliteiten", vendor.venueFacilities],
                  ["Dinermogelijkheden", vendor.cateringOptions],
                  ["Barmogelijkheden", vendor.barOptions],
                  ["Omgeving", vendor.environment],
                ].map(([label, values]) => {
                  const list = values as string[] | undefined;
                  if (!list || list.length === 0) return null;
                  return (
                    <div key={label as string} style={{ marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>{label}</span>
                      <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{list.join(" · ")}</p>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Regels (alleen trouwlocaties) */}
            {vendor.category === "trouwlocatie" && (vendor.closingTime || vendor.soundLimit) && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Regels</h2>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {vendor.closingTime && (
                    <div>
                      <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>Sluitingstijd</span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)" }}>{vendor.closingTime}</span>
                    </div>
                  )}
                  {vendor.soundLimit && (
                    <div>
                      <span style={{ fontSize: "0.6875rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>Geluidslimiet</span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)" }}>{vendor.soundLimit}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact */}
            <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
              <h2 className="dash-section-title mb-3">Contact</h2>
              <div className="flex flex-col gap-2.5">
                {vendor.contactPerson && <ContactRow icon={<User className="w-4 h-4" />} label={vendor.contactPerson} />}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Mail className="w-4 h-4" />} label={vendor.email} />
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Phone className="w-4 h-4" />} label={vendor.phone} />
                  </a>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <ContactRow icon={<Globe className="w-4 h-4" />} label={vendor.website.replace(/^https?:\/\//, "")} />
                  </a>
                )}
                {!vendor.contactPerson && !vendor.email && !vendor.phone && !vendor.website && (
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-light)" }}>Nog geen contactgegevens ingevuld.</p>
                )}
              </div>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section className="mb-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-3">Beoordelingen</h2>
                <div>
                  {reviews.map(r => (
                    <div key={r.id} className="dash-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "var(--gold)", fontSize: "0.9375rem", letterSpacing: "2px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{r.author.name}</span>
                      </div>
                      {r.text && <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>{r.text}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Claim profile */}
            {!vendor.userId && (
              <section className="mb-8" style={{ background: "var(--sand)", borderLeft: "3px solid var(--gold)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1.25rem 1.5rem" }}>
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.25rem", color: "var(--foreground)" }}>Is dit jouw bedrijf?</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Claim dit profiel om het te beheren, foto&apos;s toe te voegen en aanvragen van bruidsparen te ontvangen.
                </p>
                {claimSent ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--gold-deep)", fontWeight: 600 }}>
                    Aanvraag verstuurd! We nemen je verzoek in behandeling en sturen je een e-mail zodra het is goedgekeurd.
                  </p>
                ) : (
                  <form onSubmit={handleClaim} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <input
                      type="email"
                      required
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      placeholder="jouw@email.nl"
                      className="ddp-input"
                      style={{ flex: "1 1 200px" }}
                    />
                    <button type="submit" disabled={claimSending} className="ddp-btn-primary">
                      {claimSending ? "Bezig…" : "Profiel claimen"}
                    </button>
                  </form>
                )}
                {claimError && <p style={{ fontSize: "0.8125rem", color: "var(--danger)", marginTop: "0.5rem" }}>{claimError}</p>}
              </section>
            )}

            {/* Contact form */}
            {!isVendorOwner && (
              <section className="pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <h2 className="dash-section-title mb-1">Stuur een aanvraag</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                  Stel een vraag of doe een vrijblijvende aanvraag bij {vendor.name}.
                </p>
                {contactSent ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--gold-deep)", fontWeight: 600 }}>
                    Aanvraag verstuurd! {vendor.name} neemt zo snel mogelijk contact op.
                  </p>
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
                          className="ddp-input"
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
                        className="ddp-input resize-none"
                      />
                    </div>
                    <button type="submit" disabled={contactSending} className="ddp-btn-primary" style={{ alignSelf: "flex-start" }}>
                      {contactSending ? "Verzenden…" : "Aanvraag versturen"}
                    </button>
                  </form>
                )}
              </section>
            )}

          </div>

          {/* Sidebar — Dream Team */}
          <div style={{ width: "100%", maxWidth: "300px", flexShrink: 0 }} className="lg:flex-shrink-0">
            <div className="dash-hero" style={{ padding: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.375rem", color: "var(--ink-text)" }}>
                Toevoegen aan Dream Team
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Nodig {vendor.name} uit voor jullie bruiloft. De leverancier ontvangt een verzoek en kan dit accepteren.
              </p>

              {!currentUser ? (
                <div className="flex flex-col gap-2">
                  <Link href="/aanmelden" style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, textAlign: "center", padding: "0.65rem 1rem", borderRadius: "var(--radius-full)", textDecoration: "none", fontSize: "0.875rem" }}>
                    Account aanmaken
                  </Link>
                  <Link href="/login" style={{ background: "transparent", border: "1px solid var(--ink-line)", color: "var(--ink-text)", fontWeight: 600, textAlign: "center", padding: "0.65rem 1rem", borderRadius: "var(--radius-full)", textDecoration: "none", fontSize: "0.875rem" }}>
                    Inloggen
                  </Link>
                </div>
              ) : isVendorOwner ? (
                <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>Dit is jouw eigen profiel.</p>
              ) : added ? (
                <div className="flex items-center gap-2" style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 600 }}>
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
                    style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, textAlign: "center", padding: "0.65rem 1rem", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer", fontSize: "0.875rem", opacity: (adding || !selectedWedding) ? 0.6 : 1 }}
                  >
                    {adding ? "Bezig…" : "Uitnodigen voor Dream Team"}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>
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
    <div className="flex items-center gap-2.5" style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>
      <span style={{ color: "var(--gold-deep)", display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "var(--muted)" }}>{label}</span>
    </div>
  );
}
