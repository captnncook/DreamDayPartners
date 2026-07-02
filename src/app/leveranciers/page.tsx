"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, LayoutGrid, Map } from "lucide-react";

const VendorMap = lazy(() => import("@/components/VendorMap"));

const CATEGORIES: { value: string; label: string }[] = [
  { value: "trouwlocatie",    label: "Trouwlocaties" },
  { value: "fotograaf",       label: "Fotografen" },
  { value: "videograaf",      label: "Videografen" },
  { value: "bloemist",        label: "Bloemisten" },
  { value: "catering",        label: "Catering" },
  { value: "bakker",          label: "Bruidstaarten" },
  { value: "weddingplanner",  label: "Wedding planners" },
  { value: "haarstylist",     label: "Hair & make-up" },
  { value: "dj",              label: "Muziek & DJ" },
  { value: "liveband",        label: "Liveband" },
  { value: "ceremoniespreker",label: "Ceremoniesprekers" },
  { value: "decoratie",       label: "Decoratie & Styling" },
  { value: "vervoer",         label: "Vervoer" },
  { value: "fotocabine",      label: "Fotocabine" },
  { value: "overig",          label: "Overig" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

type Vendor = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isPremium: boolean;
  coverPhotoUrl?: string | null;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  priceFrom?: number | null;
};

function LeveranciersContent() {
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLoggedIn(Boolean(d?.user)))
      .catch(() => {});
  }, []);

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

  // Premium eerst binnen elke categorie
  const sorted = [...vendors].sort((a, b) => Number(b.isPremium) - Number(a.isPremium));

  const grouped = category
    ? { [category]: sorted }
    : sorted.reduce<Record<string, Vendor[]>>((acc, v) => {
        (acc[v.category] = acc[v.category] ?? []).push(v);
        return acc;
      }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ background: "var(--ink)", padding: "1.5rem 1.25rem 2.5rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8" style={{ gap: "0.75rem" }}>
            <Link href="/" className="inline-flex items-center gap-2" style={{ minWidth: 0 }}>
              <Image src="/images/logo-wit.svg" alt="" width={24} height={24} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "var(--ink-text)", whiteSpace: "nowrap" }}>
                DreamDay<span style={{ color: "var(--gold)" }}> Platform</span>
              </span>
            </Link>
            {loggedIn ? (
              <Link href="/dashboard" style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "0.8125rem", padding: "0.45rem 1.125rem", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", flexShrink: 0 }}>
                Profiel
              </Link>
            ) : (
              <Link href="/login" style={{ color: "var(--ink-text)", fontSize: "0.8125rem", fontWeight: 600, padding: "0.45rem 0.875rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                Inloggen
              </Link>
            )}
          </div>

          <p className="ddp-section-label mb-2" style={{ color: "var(--gold)" }}>Leveranciersoverzicht</p>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.625rem, 5vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.12, color: "var(--ink-text)", marginBottom: "0.625rem" }}>
            Vind leveranciers die passen bij jullie dag
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--ink-muted)", maxWidth: "440px", lineHeight: 1.6 }}>
            Vergelijk fotografen, bloemisten, locaties en cateraars in één overzicht.
          </p>

          {/* Search bar */}
          <div className="flex gap-3 mt-6 flex-wrap items-center">
            <div className="ddp-search" style={{ flex: "1 1 240px", maxWidth: "420px" }}>
              <Search />
              <input
                type="text"
                placeholder="Zoek op naam of stad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "0.7rem 1rem 0.7rem 2.5rem", fontSize: "0.9375rem", border: "none" }}
              />
            </div>
            {hasFilter && (
              <button
                onClick={() => { setSearch(""); setCategory(""); }}
                className="flex items-center gap-1.5"
                style={{ background: "transparent", border: "1px solid var(--ink-line)", color: "var(--ink-text)", borderRadius: "var(--radius-full)", padding: "0.6rem 1.125rem", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                <X className="w-3.5 h-3.5" /> Alles wissen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category chips ───────────────────────────── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0.875rem 1.25rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => setCategory("")} className={`ddp-chip${!category ? " active" : ""}`}>
            Alles
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
              className={`ddp-chip${category === c.value ? " active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.75rem 1.25rem 4rem" }}>

        {/* Results header */}
        {!loading && vendors.length > 0 && (
          <div className="flex items-center justify-between mb-4" style={{ gap: "0.75rem" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", minWidth: 0 }}>
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{vendors.length}</span>{" "}
              leverancier{vendors.length !== 1 ? "s" : ""}
              {category && ` · ${CATEGORY_MAP[category] ?? category}`}
            </p>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
              <button
                onClick={() => setView("list")}
                aria-label="Lijstweergave"
                style={{ padding: "0.4rem 0.7rem", background: view === "list" ? "var(--ink)" : "transparent", color: view === "list" ? "white" : "var(--muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView("map")}
                aria-label="Kaartweergave"
                style={{ padding: "0.4rem 0.7rem", background: view === "map" ? "var(--ink)" : "transparent", color: view === "map" ? "white" : "var(--muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Map className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "0.9375rem" }}>Leveranciers laden…</p>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <h3 className="font-serif" style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--foreground)" }}>Geen leveranciers gevonden</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
              Pas je filters aan of zoek op een andere naam.
            </p>
            <button onClick={() => { setSearch(""); setCategory(""); }} className="ddp-btn-secondary">
              Alles wissen
            </button>
          </div>
        ) : view === "map" ? (
          <Suspense fallback={
            <div style={{ height: "480px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--sand)", borderRadius: "var(--radius-lg)" }}>
              <p style={{ color: "var(--muted)" }}>Kaart laden…</p>
            </div>
          }>
            <VendorMap vendors={vendors} />
          </Suspense>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} style={{ marginBottom: "2.5rem" }}>
              {!category && (
                <div className="flex items-baseline gap-2.5 mb-1" style={{ padding: "0 0.75rem" }}>
                  <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>
                    {CATEGORY_MAP[cat] ?? cat}
                  </h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--muted-light)" }}>{items.length}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {items.map((v) => <VendorRow key={v.id} vendor={v} showCategory={!!category} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function VendorRow({ vendor, showCategory }: { vendor: Vendor; showCategory: boolean }) {
  const catLabel = CATEGORY_MAP[vendor.category] ?? vendor.category;
  const meta = [vendor.city, showCategory ? catLabel : null].filter(Boolean).join(" · ");
  const initials = vendor.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Link href={`/leveranciers/${vendor.id}`} className={`vcat-row${vendor.isPremium ? " premium" : ""}`}>
      <div className="vcat-photo">
        {vendor.coverPhotoUrl ? (
          <Image src={vendor.coverPhotoUrl} alt={vendor.name} fill sizes="84px" style={{ objectFit: "cover" }} />
        ) : (
          <span className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--muted-light)" }}>{initials}</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        {vendor.isPremium && (
          <div style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-deep)", marginBottom: "1px" }}>
            Aanbevolen
          </div>
        )}
        <div className="vcat-name">{vendor.name}</div>
        {meta && <div className="vcat-meta">{meta}</div>}
      </div>

      <div className="vcat-desc">{vendor.description ?? ""}</div>

      <div className="vcat-price">
        {vendor.priceFrom != null ? (
          <>
            <div className="label">vanaf</div>
            <div className="amount">€{vendor.priceFrom.toLocaleString("nl-NL")}</div>
          </>
        ) : (
          <div className="label" style={{ fontSize: "0.6875rem" }}>Op aanvraag</div>
        )}
      </div>
    </Link>
  );
}

export default function LeveranciersPage() {
  return (
    <Suspense>
      <LeveranciersContent />
    </Suspense>
  );
}
