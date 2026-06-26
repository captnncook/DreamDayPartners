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
};
type Wedding = { id: string; title: string; date: string };
type CurrentUser = { id: string; role: string; name: string };

export default function VendorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWedding, setSelectedWedding] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

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
    } else {
      const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
      const pData = await photosRes.json();
      setPhotoUrls(pData.urls ?? []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

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
            <Image src="/logo.png" alt="" width={18} height={18} />
            <span style={{ fontWeight: 700 }}>DreamDay Partners</span>
          </Link>
        </div>

        {/* Photos grid */}
        {photoUrls.length > 0 ? (
          <div style={{ maxWidth: "1040px", margin: "1.25rem auto 0", padding: "0 1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: photoUrls.length === 1 ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px", borderRadius: "var(--radius-lg)", overflow: "hidden", maxHeight: "340px" }}>
              {photoUrls.slice(0, 3).map((url, i) => (
                <div key={i} style={{ position: "relative", height: "240px" }}>
                  <Image src={url} alt={`${vendor.name} foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "1040px", margin: "1.25rem auto 0", padding: "0 1.25rem" }}>
            <div style={{ height: "220px", borderRadius: "var(--radius-lg)", background: "var(--color-blush)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-blush)" }}>
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

            {/* Contact */}
            <div className="ddp-card">
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                Contactgegevens
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
