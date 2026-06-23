"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ArrowRight, SlidersHorizontal, X, LayoutGrid, Map } from "lucide-react";

const VendorMap = lazy(() => import("@/components/VendorMap"));

const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: "trouwlocatie",    label: "Trouwlocaties",       emoji: "🏛️" },
  { value: "fotograaf",       label: "Fotografen",          emoji: "📷" },
  { value: "videograaf",      label: "Videografen",         emoji: "🎥" },
  { value: "bloemist",        label: "Bloemisten",          emoji: "🌸" },
  { value: "catering",        label: "Catering",            emoji: "🍽️" },
  { value: "bakker",          label: "Bruidstaarten",       emoji: "🎂" },
  { value: "weddingplanner",  label: "Wedding planners",    emoji: "💍" },
  { value: "haarstylist",     label: "Hair & make-up",      emoji: "💄" },
  { value: "dj",              label: "Muziek & DJ",         emoji: "🎧" },
  { value: "liveband",        label: "Liveband",            emoji: "🎵" },
  { value: "ceremoniespreker",label: "Ceremoniesprekers",   emoji: "🎤" },
  { value: "decoratie",       label: "Decoratie & Styling", emoji: "✨" },
  { value: "vervoer",         label: "Vervoer",             emoji: "🚗" },
  { value: "fotocabine",      label: "Fotocabine",          emoji: "📸" },
  { value: "overig",          label: "Overig",              emoji: "⭐" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

type Vendor = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isPremium: boolean;
  photos: string[];
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function LeveranciersPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"grid" | "map">("grid");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("search", debouncedSearch);
    const res = await fetch(`/api/catalogus?${params}`);
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  }, [category, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const hasFilter = !!category || !!search;

  const grouped = category
    ? { [category]: vendors }
    : vendors.reduce<Record<string, Vendor[]>>((acc, v) => {
        (acc[v.category] = acc[v.category] ?? []).push(v);
        return acc;
      }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ background: "var(--color-cream)", borderBottom: "1px solid var(--border)", padding: "3rem 1.25rem 2.5rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-1.5 mb-6 text-sm" style={{ color: "var(--muted)" }}>
            <Image src="/logo.png" alt="" width={18} height={18} />
            DreamDay Partners
          </Link>

          <p className="ddp-section-label mb-2">Leveranciersoverzicht</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--foreground)", marginBottom: "0.75rem" }}>
            Vind leveranciers die passen<br className="hidden md:block" /> bij jullie dag
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: "460px", lineHeight: 1.65 }}>
            Vergelijk fotografen, bloemisten, locaties en cateraars in één handig overzicht.
          </p>

          {/* Search bar */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "420px" }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-light)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Zoek op naam of stad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: "0.9375rem", outline: "none", background: "white", color: "var(--foreground)", boxShadow: "var(--shadow-sm)" }}
              />
            </div>
            {hasFilter && (
              <button
                onClick={() => { setSearch(""); setCategory(""); }}
                className="ddp-btn-secondary flex items-center gap-1.5"
                style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem" }}
              >
                <X className="w-3.5 h-3.5" /> Alles wissen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category chips ───────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "1rem 1.25rem", overflowX: "auto" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", display: "flex", gap: "0.5rem", flexWrap: "nowrap", minWidth: 0 }}>
          <button
            onClick={() => setCategory("")}
            className={`ddp-chip${!category ? " active" : ""}`}
            style={{ flexShrink: 0 }}
          >
            Alles
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
              className={`ddp-chip${category === c.value ? " active" : ""}`}
              style={{ flexShrink: 0 }}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* Results header */}
        {!loading && vendors.length > 0 && (
          <div className="flex items-center justify-between mb-5" style={{ gap: "0.75rem" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", minWidth: 0 }}>
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{vendors.length}</span>{" "}
              leverancier{vendors.length !== 1 ? "s" : ""} gevonden
              {category && ` · ${CATEGORY_MAP[category] ?? category}`}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1.5" style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Premium eerst</span>
              </div>
              <div style={{ display: "flex", flexDirection: "row", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <button
                  onClick={() => setView("grid")}
                  style={{ padding: "0.375rem 0.625rem", background: view === "grid" ? "var(--color-charcoal)" : "transparent", color: view === "grid" ? "white" : "var(--muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setView("map")}
                  style={{ padding: "0.375rem 0.625rem", background: view === "map" ? "var(--color-charcoal)" : "transparent", color: view === "map" ? "white" : "var(--muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Map className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.4 }}>🌸</div>
            <p style={{ fontSize: "0.9375rem" }}>Leveranciers laden…</p>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.35 }}>🔍</div>
            <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Geen leveranciers gevonden</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
              Pas je filters aan of zoek op een andere naam.
            </p>
            <button onClick={() => { setSearch(""); setCategory(""); }} className="ddp-btn-secondary">
              Alles wissen
            </button>
          </div>
        ) : view === "map" ? (
          <Suspense fallback={
            <div style={{ height: "480px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-blush-soft)", borderRadius: "var(--radius-lg)" }}>
              <p style={{ color: "var(--muted)" }}>Kaart laden…</p>
            </div>
          }>
            <VendorMap vendors={vendors} />
          </Suspense>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: "3rem" }}>
              {!category && (
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
                    {CATEGORY_MAP[cat] ?? cat}
                  </h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--muted)", background: "rgba(31,36,40,0.05)", borderRadius: "var(--radius-full)", padding: "0.15rem 0.625rem" }}>
                    {items.length}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((v) => <SupplierCard key={v.id} vendor={v} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SupplierCard({ vendor }: { vendor: Vendor }) {
  const catLabel = CATEGORY_MAP[vendor.category] ?? vendor.category;
  const emoji = CATEGORIES.find((c) => c.value === vendor.category)?.emoji ?? "⭐";

  return (
    <Link href={`/leveranciers/${vendor.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 14px 36px rgba(31,36,40,0.08)";
          el.style.borderColor = "#DDD1C4";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
          el.style.borderColor = "var(--border)";
        }}
      >
        {/* Image area — 4:3 */}
        <div style={{ aspectRatio: "4/3", background: "var(--color-blush-soft)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <span style={{ fontSize: "3rem", opacity: 0.5 }}>{emoji}</span>

          {/* Status badge */}
          {vendor.isPremium ? (
            <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "var(--color-champagne)", color: "#7a5c1a", borderRadius: "var(--radius-full)", padding: "0.2rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              ✦ Aanbevolen
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div style={{ padding: "1.125rem 1.25rem 1.375rem", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Category */}
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "0.3rem" }}>
            {catLabel}
          </p>

          {/* Name */}
          <h3 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "0.375rem", lineHeight: 1.25 }}>
            {vendor.name}
          </h3>

          {/* Location */}
          {vendor.city && (
            <div className="flex items-center gap-1 mb-2" style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{vendor.city}</span>
            </div>
          )}

          {/* Description */}
          {vendor.description && (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", marginBottom: "0.875rem" }}>
              {vendor.description}
            </p>
          )}

          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Prijs op aanvraag</span>
            <span className="flex items-center gap-1" style={{ fontSize: "0.8125rem", color: "var(--color-charcoal)", fontWeight: 600 }}>
              Bekijk profiel <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
