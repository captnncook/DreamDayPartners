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
  priceFrom?: number; priceTo?: number; priceUnit?: string; specializations?: string[]; busyDates?: string[];
};

import { Suspense } from "react";

const WEEKDAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MONTHS_NL = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];

function BusyCalendar({ busyDates, onToggle }: {
  busyDates: string[];
  onToggle: (date: string) => void;
}) {
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  // Monday-based: getDay() 0=Sun → pos 6, 1=Mon → pos 0, etc.
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function pad(n: number) { return String(n).padStart(2, "0"); }
  function dateStr(d: number) { return `${year}-${pad(month + 1)}-${pad(d)}`; }

  return (
    <div>
      {/* Month navigator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--muted)", padding: "0.25rem 0.5rem" }}>‹</button>
        <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{MONTHS_NL[month]} {year}</span>
        <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--muted)", padding: "0.25rem 0.5rem" }}>›</button>
      </div>
      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "2px" }}>
        {WEEKDAYS.map(w => <div key={w} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted)", padding: "0.25rem 0" }}>{w}</div>)}
      </div>
      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const ds = dateStr(day);
          const isBusy = busyDates.includes(ds);
          const isPast = new Date(ds) < new Date(new Date().toDateString());
          return (
            <button key={ds} onClick={() => !isPast && onToggle(ds)} style={{
              padding: "0.375rem 0.25rem", borderRadius: "6px", border: "none", cursor: isPast ? "default" : "pointer",
              background: isBusy ? "#fee2e2" : "var(--accent)",
              color: isBusy ? "#b91c1c" : isPast ? "var(--muted)" : "var(--foreground)",
              fontWeight: isBusy ? 700 : 400, fontSize: "0.8125rem", transition: "background 0.1s",
              opacity: isPast ? 0.4 : 1,
            }}>
              {day}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem" }}>Klik op een dag in de kalender om hem te blokkeren of deblokkeren.</p>
      {busyDates.length > 0 && (
        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {busyDates.sort().map(d => (
            <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "9999px", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
              {new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(d))}
              <button onClick={() => onToggle(d)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c", padding: 0, lineHeight: 1, fontSize: "0.9rem" }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VendorEditPageWrapper() {
  return <Suspense><VendorEditPage /></Suspense>;
}

function VendorEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const emblemInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const upgradeStatus = searchParams.get("upgrade");

  const SPECIALIZATIONS_PLACEHOLDER: Record<string, string> = {
    weddingplanner: "bijv. full-service planning, dag-van coördinatie, bestemmingsbruiloft",
    fotograaf: "bijv. documentair, editorial, bruidsfotografie, portret",
    videograaf: "bijv. cinematic films, same-day edits, drone, documentair",
    bloemist: "bijv. bruidsboeket, corsages, tafeldecoratie, bloemenboog",
    dj: "bijv. bruiloften, openingsdans, liveoptredens, MC",
    catering: "bijv. walking dinner, diner, buffet, foodtruck",
    bakker: "bijv. bruidstaart, cupcakes, donutwall, taartproeverij",
    haarstylist: "bijv. bruidsopsteekhaar, bruidsstyling, extensions",
    visagist: "bijv. bruidsmake-up, airbrush, HMUA",
    trouwlocatie: "bijv. buitenlocatie, landgoed, industrieel, intiem",
    vervoer: "bijv. oldtimers, limousines, bruidsbussen, vintage",
    trouwauto: "bijv. oldtimer, cabriolet, limousine, elektrisch",
    verhuur: "bijv. meubilair, linnen, servies, podium",
    bar: "bijv. cocktails, wijnproeverij, champagnebar",
    koffiebar: "bijv. barista, specialty coffee, foodtruck",
    liveband: "bijv. jazz, pop covers, akoestische sets, soul, eerste dans",
    entertainment: "bijv. goochelaar, acrobaat, fotoboek, bruidsquiz",
    tentverhuur: "bijv. partytent, tipi, glazen paviljoen, feesttent",
    fotocabine: "bijv. photobooth, open booth, neon achtergrond",
  };

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
  const [uploadingEmblem, setUploadingEmblem] = useState(false);
  const [emblemUrl, setEmblemUrl] = useState<string | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [newBusyDate, setNewBusyDate] = useState("");

  const [form, setForm] = useState({
    description: "", city: "", contactPerson: "", phone: "", website: "",
    priceFrom: "", priceTo: "", priceUnit: "", specializations: "",
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
      priceFrom: v.priceFrom != null ? String(v.priceFrom) : "",
      priceTo: v.priceTo != null ? String(v.priceTo) : "",
      priceUnit: v.priceUnit ?? "",
      specializations: (v.specializations ?? []).join(", "),
    });
    setBusyDates(v.busyDates ?? []);

    const photosRes = await fetch(`/api/catalogus/${id}/signed-photos`);
    const pData = await photosRes.json();
    setCoverUrl(pData.coverUrl ?? null);
    setCoverKey(v.coverPhoto ?? null);
    setEmblemUrl(pData.emblemUrl ?? null);
    setPhotoUrls(pData.urls ?? []);
    setPhotoKeys(v.photos ?? []);

    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    const specializations = form.specializations.split(",").map(s => s.trim()).filter(Boolean);
    const res = await fetch(`/api/catalogus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, specializations }),
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

  async function toggleBusyDate(date: string) {
    const updated = busyDates.includes(date) ? busyDates.filter(d => d !== date) : [...busyDates, date].sort();
    setBusyDates(updated);
    await fetch(`/api/catalogus/${id}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ busyDates: updated }),
    });
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

  async function handleEmblemUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEmblem(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/catalogus/${id}/emblem-photo`, { method: "POST", body: fd });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (!res.ok) setError((data.error as string) ?? `Upload mislukt (${res.status})`);
      else setEmblemUrl(data.url as string);
    } catch {
      setError("Verbindingsfout tijdens upload");
    } finally {
      setUploadingEmblem(false);
      if (emblemInputRef.current) emblemInputRef.current.value = "";
    }
  }

  async function handleDeleteEmblem() {
    const res = await fetch(`/api/catalogus/${id}/emblem-photo`, { method: "DELETE" });
    if (res.ok) setEmblemUrl(null);
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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.25rem" }}>
        {[100, 60, 80, 60, 90, 70].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? "2.5rem" : "2.75rem", width: `${w}%`, borderRadius: "10px", marginBottom: "1rem",
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "skeleton-shimmer 1.5s infinite" }} />
        ))}
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
        {/* Premium status banner — shown at top */}
        {isUserPremium && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e", fontWeight: 600 }}>
            <Star className="w-4 h-4" style={{ color: "#d97706", flexShrink: 0 }} />
            Premium actief — je profiel staat bovenaan de zoekresultaten.
          </div>
        )}
        {upgradeStatus === "success" && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#166534", marginBottom: "1rem" }}>
            Premium actief — welkom bij DreamDay Platform Pro!
          </div>
        )}
        {upgradeStatus === "cancelled" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#92400e", marginBottom: "1rem" }}>
            Betaling geannuleerd. Je kunt het altijd opnieuw proberen.
          </div>
        )}
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

        {/* Embleem foto */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Embleem foto</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Portretfoto die verschijnt in het Dream Team overzicht van het bruidspaar en in de chat. Gebruik een foto waarbij je gezicht goed zichtbaar is.
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Shield preview */}
            <div style={{ position: "relative", width: "120px", flexShrink: 0 }}>
              <svg viewBox="0 0 120 140" width="120" height="140" style={{ display: "block" }}>
                <defs>
                  <clipPath id="shield-clip-edit">
                    <path d="M60 4 L108 22 L108 72 C108 100 84 124 60 136 C36 124 12 100 12 72 L12 22 Z" />
                  </clipPath>
                </defs>
                <path d="M60 4 L108 22 L108 72 C108 100 84 124 60 136 C36 124 12 100 12 72 L12 22 Z"
                  fill={emblemUrl ? "#1a1a1a" : "var(--accent)"} stroke="var(--border)" strokeWidth="2" />
                {emblemUrl ? (
                  <image href={emblemUrl} x="12" y="4" width="96" height="132" clipPath="url(#shield-clip-edit)" preserveAspectRatio="xMidYMid slice" />
                ) : (
                  <text x="60" y="80" textAnchor="middle" fill="var(--muted)" fontSize="32" fontWeight="300">+</text>
                )}
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem" }}>
              <button onClick={() => emblemInputRef.current?.click()} disabled={uploadingEmblem}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem" }}>
                <Upload className="w-4 h-4" />
                {uploadingEmblem ? "Uploaden…" : emblemUrl ? "Vervangen" : "Foto uploaden"}
              </button>
              {emblemUrl && (
                <button onClick={handleDeleteEmblem}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", color: "var(--danger)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.8125rem" }}>
                  <Trash2 className="w-4 h-4" /> Verwijderen
                </button>
              )}
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Max 10 MB · JPG, PNG, WebP</p>
            </div>
          </div>
          <input ref={emblemInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleEmblemUpload} />
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

        {/* Prijzen & specialisaties */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Prijsindicatie & specialisaties</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Geef bruidsparen een richtprijs en vertel in welke specialisaties jullie uitblinken.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { key: "priceFrom", label: "Startprijs (€)", placeholder: "bijv. 45" },
              { key: "priceTo", label: "Tot (€)", placeholder: "bijv. 120" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>{label}</label>
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "0.875rem", outline: "none" }}
                />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>Prijseenheid</label>
            <select
              value={form.priceUnit}
              onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
              style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "0.875rem", outline: "none", background: "white" }}
            >
              <option value="">Geen eenheid</option>
              <option value="per persoon">per persoon</option>
              <option value="per couvert">per couvert</option>
              <option value="per event">per event</option>
              <option value="per uur">per uur</option>
              <option value="per dag">per dag</option>
              <option value="per tafel">per tafel</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: "0.375rem" }}>Specialisaties (komma-gescheiden)</label>
            <input
              type="text"
              value={form.specializations}
              onChange={(e) => setForm({ ...form, specializations: e.target.value })}
              placeholder={SPECIALIZATIONS_PLACEHOLDER[vendor?.category ?? ""] ?? "bijv. bruidsboeket, corsages, fotografie..."}
              style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
        </section>

        {/* Beschikbaarheid */}
        <section style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>Beschikbaarheid</h2>
          <BusyCalendar busyDates={busyDates} onToggle={toggleBusyDate} />
        </section>

        <section style={{ background: isUserPremium ? "#fffbeb" : "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", border: `1px solid ${isUserPremium ? "#fde68a" : "#C9A96E"}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <Star className="w-4 h-4" style={{ color: isUserPremium ? "#d97706" : "#C9A96E" }} />
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: isUserPremium ? "#92400e" : "var(--foreground)" }}>
                  {isUserPremium ? "Premium actief" : "Upgrade naar Premium"}
                </span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: isUserPremium ? "#b45309" : "var(--muted)", maxWidth: "360px" }}>
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
