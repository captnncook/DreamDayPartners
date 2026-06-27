"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Trash2, Save, Check, Star } from "lucide-react";

const CATEGORIES = [
  { value: "weddingplanner", label: "Weddingplanner" },
  { value: "fotograaf", label: "Fotograaf" },
  { value: "videograaf", label: "Videograaf" },
  { value: "bloemist", label: "Bloemist" },
  { value: "catering", label: "Catering" },
  { value: "bakker", label: "Bruidstaart & Bakker" },
  { value: "dj", label: "DJ" },
  { value: "liveband", label: "Liveband & Muziek" },
  { value: "ceremoniespreker", label: "Ceremoniespreker" },
  { value: "trouwlocatie", label: "Trouwlocatie" },
  { value: "haarstylist", label: "Haar & Make-up" },
  { value: "vervoer", label: "Vervoer" },
  { value: "decoratie", label: "Decoratie & Styling" },
  { value: "fotocabine", label: "Fotocabine" },
  { value: "overig", label: "Overig" },
];

void CATEGORIES;

type Vendor = {
  id: string; name: string; category: string; contactPerson?: string;
  email?: string; phone?: string; website?: string; description?: string;
  isPremium: boolean; photos: string[]; city?: string; userId?: string;
};

import { Suspense } from "react";

export default function VendorEditPageWrapper() {
  return <Suspense><VendorEditPage /></Suspense>;
}

function VendorEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const upgradeStatus = searchParams.get("upgrade");

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    description: "", city: "", contactPerson: "", phone: "", website: "",
  });

  const load = useCallback(async () => {
    const [vRes, meRes] = await Promise.all([
      fetch(`/api/catalogus/${id}`),
      fetch("/api/auth/me"),
    ]);
    const vData = await vRes.json();
    const meData = await meRes.json();

    if (!vData.vendor) { router.push("/leveranciers"); return; }
    if (!meData.user || meData.user.id !== vData.vendor.userId) {
      router.push(`/leveranciers/${id}`);
      return;
    }

    const v = vData.vendor;
    setVendor(v);
    setIsUserPremium(meData.user?.isPremium ?? false);
    setForm({
      description: v.description ?? "",
      city: v.city ?? "",
      contactPerson: v.contactPerson ?? "",
      phone: v.phone ?? "",
      website: v.website ?? "",
    });

    const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
    const pData = await photosRes.json();
    setCoverUrl(pData.coverUrl ?? null);
    setCoverKey(v.coverPhoto ?? null);
    setPhotoUrls(pData.urls ?? []);
    setPhotoKeys(v.photos ?? []);

    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/catalogus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Opslaan mislukt");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/catalogus/${id}/cover-photo`, { method: "POST", body: fd });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (!res.ok) {
        setError((data.error as string) ?? `Upload mislukt (${res.status})`);
      } else {
        setCoverUrl(data.url as string);
        setCoverKey(data.key as string);
      }
    } catch {
      setError("Verbindingsfout tijdens upload");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handleDeleteCover() {
    const res = await fetch(`/api/catalogus/${id}/cover-photo`, { method: "DELETE" });
    if (res.ok) { setCoverUrl(null); setCoverKey(null); }
    void coverKey;
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/catalogus/${id}/photos`, { method: "POST", body: fd });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (!res.ok) {
        setError((data.error as string) ?? `Upload mislukt (${res.status})`);
      } else {
        setPhotoUrls((data.photos as string[]) ?? []);
        setPhotoKeys((data.keys as string[]) ?? []);
      }
    } catch {
      setError("Verbindingsfout tijdens upload");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function handleDeletePhoto(key: string, idx: number) {
    const res = await fetch(`/api/catalogus/${id}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      setPhotoUrls(photoUrls.filter((_, i) => i !== idx));
      setPhotoKeys(photoKeys.filter((k) => k !== key));
    }
  }

  async function handleUpgrade() {
    setBillingLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error ?? "Kan niet verbinden met betaalservice"); setBillingLoading(false); }
  }

  async function handlePortal() {
    setBillingLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error ?? "Kan niet verbinden met betaalservice"); setBillingLoading(false); }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <p style={{ color: "var(--muted)" }}>Laden…</p>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7", color: "var(--foreground)" }}>
      <div style={{ background: "var(--foreground)", padding: "1.25rem 1.25rem 2rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Link
            href={`/leveranciers/${id}`}
            className="inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem", display: "inline-flex" }}
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar profiel
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.04em", color: "white" }}>
            Profiel bewerken
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{vendor.name}</p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "1.5rem auto", padding: "0 1.25rem 3rem" }}>
        {error && (
          <div style={{ background: "#fee", border: "1px solid #fcc", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#c00", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Profielfoto (cover) */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Profielfoto</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Wordt getoond op de leverancierskaart in het overzicht. Kies een opvallende foto die jullie werk goed vertegenwoordigt.
          </p>

          {coverUrl ? (
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", aspectRatio: "4/3", maxWidth: "280px" }}>
              <Image src={coverUrl} alt="Profielfoto" fill style={{ objectFit: "cover" }} />
              <button
                onClick={handleDeleteCover}
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "8px",
                  padding: "6px", cursor: "pointer", display: "flex",
                }}
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: "white" }} />
              </button>
              <button
                onClick={() => coverInputRef.current?.click()}
                style={{
                  position: "absolute", bottom: "8px", right: "8px",
                  background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "8px",
                  padding: "5px 10px", cursor: "pointer", color: "white", fontSize: "0.75rem", fontWeight: 600,
                }}
              >
                Vervangen
              </button>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                width: "280px", aspectRatio: "4/3",
                border: "2px dashed rgba(0,0,0,0.15)", borderRadius: "12px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", cursor: "pointer", background: "none", color: "var(--muted)", fontSize: "0.8125rem",
              }}
            >
              <Upload className="w-5 h-5" />
              {uploadingCover ? "Uploaden…" : "Profielfoto toevoegen"}
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem" }}>Max 10 MB · JPG, PNG, WebP</p>
        </section>

        {/* Galerij */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Galerij</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Tot 12 foto&apos;s die worden getoond op jullie profielpagina. Laat zien wat jullie kunnen!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {photoUrls.map((url, i) => (
              <div key={i} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3" }}>
                <Image src={url} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                <button
                  onClick={() => handleDeletePhoto(photoKeys[i], i)}
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "6px",
                    padding: "4px", cursor: "pointer", display: "flex",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "white" }} />
                </button>
              </div>
            ))}

            {photoUrls.length < 12 && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                style={{
                  aspectRatio: "4/3", border: "2px dashed rgba(0,0,0,0.15)", borderRadius: "10px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", cursor: "pointer", background: "none", color: "var(--muted)", fontSize: "0.8125rem",
                }}
              >
                <Upload className="w-5 h-5" />
                {uploadingGallery ? "Uploaden…" : "Foto toevoegen"}
              </button>
            )}
          </div>

          <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleGalleryUpload} />
          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Max 12 foto&apos;s · Max 10 MB per foto</p>
        </section>

        {/* Tekst & info */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>Informatie</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>
                Over ons / beschrijving
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Schrijf een beschrijving over jullie diensten, aanpak en wat jullie uniek maakt…"
                style={{
                  width: "100%", padding: "0.75rem", border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px", fontSize: "0.875rem", resize: "vertical", outline: "none",
                  lineHeight: 1.6, fontFamily: "inherit",
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "city", label: "Stad / regio", placeholder: "bijv. Amsterdam" },
                { key: "contactPerson", label: "Contactpersoon", placeholder: "Voornaam achternaam" },
                { key: "phone", label: "Telefoonnummer", placeholder: "+31 6 12345678" },
                { key: "website", label: "Website", placeholder: "https://www.example.nl" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "0.625rem 0.875rem", border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: "10px", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium */}
        {upgradeStatus === "success" && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#166534", marginBottom: "1rem" }}>
            Premium actief — welkom bij DreamDay Partners Pro!
          </div>
        )}
        {upgradeStatus === "cancelled" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#92400e", marginBottom: "1rem" }}>
            Betaling geannuleerd. Je kunt het altijd opnieuw proberen.
          </div>
        )}

        <section style={{ background: isUserPremium ? "#fffbeb" : "var(--foreground)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: `1px solid ${isUserPremium ? "#fde68a" : "transparent"}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <Star className="w-4 h-4" style={{ color: isUserPremium ? "#d97706" : "#C9A96E" }} />
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: isUserPremium ? "#92400e" : "white" }}>
                  {isUserPremium ? "Premium actief" : "Upgrade naar Premium"}
                </span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: isUserPremium ? "#b45309" : "rgba(255,255,255,0.55)", maxWidth: "360px" }}>
                {isUserPremium
                  ? "Je profiel staat bovenaan de zoekresultaten en is gemarkeerd als Aanbevolen."
                  : "Kom bovenaan zoekresultaten, toon het Aanbevolen-label en bereik meer bruidsparen. Slechts €29/maand."}
              </p>
            </div>
            {isUserPremium ? (
              <button
                onClick={handlePortal}
                disabled={billingLoading}
                style={{ padding: "0.625rem 1.25rem", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
              >
                {billingLoading ? "Laden…" : "Abonnement beheren"}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={billingLoading}
                style={{ padding: "0.625rem 1.5rem", borderRadius: "9999px", background: "#C9A96E", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700 }}
              >
                {billingLoading ? "Laden…" : "Upgrade — €29/maand"}
              </button>
            )}
          </div>
        </section>

        <div className="flex gap-3 justify-end">
          <Link href={`/leveranciers/${id}`} className="ddp-btn-secondary">
            Annuleren
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ddp-btn-primary inline-flex items-center gap-2"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saved ? <><Check className="w-4 h-4" /> Opgeslagen!</> : <><Save className="w-4 h-4" /> {saving ? "Opslaan…" : "Opslaan"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
