"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Globe, Phone, Mail, Star, ArrowLeft, Check, ChevronDown, Heart,
} from "lucide-react";

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
  const [showWeddingPicker, setShowWeddingPicker] = useState(false);

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

      if (meData.user) {
        const [wRes, photosRes] = await Promise.all([
          fetch("/api/weddings"),
          fetch(`/api/catalogus/${id}/signed-photos`),
        ]);
        const wData = await wRes.json();
        setWeddings(wData.weddings ?? []);
        const pData = await photosRes.json();
        setPhotoUrls(pData.urls ?? []);
      } else {
        const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
        const pData = await photosRes.json();
        setPhotoUrls(pData.urls ?? []);
      }
    } else {
      const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
      const pData = await photosRes.json();
      setPhotoUrls(pData.urls ?? []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAddToDreamTeam() {
    if (!selectedWedding) { setShowWeddingPicker(true); return; }
    setAdding(true);
    setAddError("");
    const res = await fetch(`/api/catalogus/${id}/dream-team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId: selectedWedding }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error ?? "Er ging iets mis");
    } else {
      setAdded(true);
    }
    setAdding(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <p style={{ color: "var(--muted)" }}>Laden…</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
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
    <div className="min-h-screen" style={{ background: "#f5f5f7", color: "var(--foreground)" }}>
      {/* Header */}
      <div style={{ background: "var(--foreground)", padding: "1.25rem 1.25rem 5rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <Link
            href="/leveranciers"
            className="inline-flex items-center gap-2"
            style={{
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              display: "inline-flex",
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Catalogus
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div style={{ flex: 1 }}>
              {vendor.isPremium && (
                <div
                  className="inline-flex items-center gap-1"
                  style={{
                    background: "var(--gradient-primary)",
                    borderRadius: "999px",
                    padding: "3px 12px",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                  }}
                >
                  <Star className="w-3 h-3" /> PREMIUM LEVERANCIER
                </div>
              )}
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "white",
                  lineHeight: 1.1,
                  marginBottom: "0.5rem",
                }}
              >
                {vendor.name}
              </h1>
              <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.55)" }}>
                {CATEGORY_LABELS[vendor.category] ?? vendor.category}
                {vendor.city && <> · <MapPin className="w-3.5 h-3.5 inline mb-0.5" /> {vendor.city}</>}
              </p>
            </div>

            {isVendorOwner && (
              <Link
                href={`/leveranciers/${id}/bewerken`}
                className="ddp-btn-secondary"
                style={{ flexShrink: 0 }}
              >
                Profiel bewerken
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content card */}
      <div style={{ maxWidth: "1040px", margin: "-2.5rem auto 0", padding: "0 1.25rem 3rem" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Photos */}
          {photoUrls.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: photoUrls.length === 1 ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "2px",
                maxHeight: "360px",
                overflow: "hidden",
              }}
            >
              {photoUrls.slice(0, 3).map((url, i) => (
                <div key={i} style={{ position: "relative", height: "240px" }}>
                  <Image src={url} alt={`${vendor.name} foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row" style={{ padding: "2rem" }}>
            {/* Main content */}
            <div style={{ flex: 1 }}>
              {vendor.description && (
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
                    Over {vendor.name}
                  </h2>
                  <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                    {vendor.description}
                  </p>
                </div>
              )}

              {/* Contact info */}
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
                  Contactgegevens
                </h2>
                <div className="flex flex-col gap-3">
                  {vendor.contactPerson && (
                    <div className="flex items-center gap-2.5" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(196,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        👤
                      </div>
                      {vendor.contactPerson}
                    </div>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2.5" style={{ fontSize: "0.9rem", color: "var(--foreground)", textDecoration: "none" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(196,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Mail className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                      </div>
                      {vendor.email}
                    </a>
                  )}
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2.5" style={{ fontSize: "0.9rem", color: "var(--foreground)", textDecoration: "none" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(196,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Phone className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                      </div>
                      {vendor.phone}
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5" style={{ fontSize: "0.9rem", color: "var(--foreground)", textDecoration: "none" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(196,154,108,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Globe className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                      </div>
                      {vendor.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Dream Team sidebar */}
            <div style={{ width: "100%", maxWidth: "320px", marginTop: "2rem" }} className="lg:ml-8 lg:mt-0 lg:flex-shrink-0">
              <div
                style={{
                  background: "#f5f5f7",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Heart className="w-5 h-5 mb-3" style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                  Dream Team
                </h3>

                {!currentUser ? (
                  <>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
                      Maak een account aan om deze leverancier toe te voegen aan jouw Dream Team.
                    </p>
                    <Link href="/weddings/wizard" className="ddp-btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "0.875rem" }}>
                      Account aanmaken
                    </Link>
                    <Link href="/login" className="ddp-btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
                      Inloggen
                    </Link>
                  </>
                ) : isVendorOwner ? (
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>
                    Dit is jouw eigen profiel.
                  </p>
                ) : added ? (
                  <div className="flex items-center gap-2" style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: 600 }}>
                    <Check className="w-4 h-4" /> Toegevoegd aan Dream Team!
                  </div>
                ) : isCouple ? (
                  <>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
                      Voeg {vendor.name} toe aan jullie Dream Team.
                    </p>

                    {weddings.length > 1 && (
                      <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                        <select
                          value={selectedWedding}
                          onChange={(e) => setSelectedWedding(e.target.value)}
                          style={{
                            width: "100%",
                            appearance: "none",
                            padding: "0.625rem 2.5rem 0.625rem 1rem",
                            border: "1px solid rgba(0,0,0,0.12)",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                            outline: "none",
                            background: "white",
                          }}
                        >
                          <option value="">Kies bruiloft…</option>
                          {weddings.map((w) => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4" style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                      </div>
                    )}

                    {weddings.length === 1 && !selectedWedding && (
                      // Auto-select if only one wedding
                      <></>
                    )}

                    {addError && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--error, #e53e3e)", marginBottom: "0.75rem" }}>{addError}</p>
                    )}

                    <button
                      onClick={() => {
                        const wId = weddings.length === 1 ? weddings[0].id : selectedWedding;
                        if (!wId) { setShowWeddingPicker(true); return; }
                        setSelectedWedding(wId);
                        handleAddToDreamTeam();
                      }}
                      disabled={adding || (weddings.length > 1 && !selectedWedding)}
                      className="ddp-btn-primary"
                      style={{ width: "100%", justifyContent: "center", fontSize: "0.875rem", opacity: adding ? 0.7 : 1 }}
                    >
                      {adding ? "Toevoegen…" : "Verzoek om toe te voegen aan Dream Team"}
                    </button>

                    {showWeddingPicker && weddings.length > 1 && !selectedWedding && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--primary)", marginTop: "0.5rem" }}>
                        Selecteer eerst een bruiloft hierboven.
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>
                    Alleen bruidsparen kunnen leveranciers toevoegen aan hun Dream Team.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
