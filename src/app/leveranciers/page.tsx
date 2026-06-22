"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, ArrowRight, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Alle categorieën" },
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

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label])
);

type Vendor = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isPremium: boolean;
  photos: string[];
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export default function LeveranciersPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const grouped = category
    ? { [category]: vendors }
    : vendors.reduce<Record<string, Vendor[]>>((acc, v) => {
        (acc[v.category] = acc[v.category] ?? []).push(v);
        return acc;
      }, {});

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", color: "var(--foreground)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--foreground)",
          padding: "3rem 1.25rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <Link
            href="/"
            className="flex items-center gap-2 mb-8"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <Image src="/logo.png" alt="DreamDay Partners" width={24} height={24} className="brightness-0 invert" />
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", letterSpacing: "-0.02em" }}>
              DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
            </span>
          </Link>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.05,
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Vind jouw{" "}
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dream Partner
            </span>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.55)", maxWidth: "480px", lineHeight: 1.65 }}>
            Alle trouwleveranciers op één plek. Filter op categorie en voeg ze direct toe aan jullie Dream Team.
          </p>
        </div>
      </div>

      {/* Sticky search bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "0.875rem 1.25rem",
          marginTop: "-2.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1040px",
            margin: "0 auto",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search
              className="w-4 h-4"
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Zoek leverancier of stad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "2.5rem",
                paddingRight: "0.875rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "999px",
                fontSize: "0.875rem",
                outline: "none",
                background: "white",
              }}
            />
          </div>

          {/* Category select */}
          <div style={{ position: "relative", flex: "0 1 220px" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                appearance: "none",
                padding: "0.625rem 2.5rem 0.625rem 1rem",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "999px",
                fontSize: "0.875rem",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4"
              style={{
                position: "absolute",
                right: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "2.5rem 1.25rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)", fontSize: "0.9375rem" }}>
            Leveranciers laden…
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <p style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>
              Geen leveranciers gevonden. Pas je zoekopdracht aan.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: "3rem" }}>
              {!category && (
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--foreground)",
                    marginBottom: "1rem",
                    paddingBottom: "0.625rem",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                  <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                    ({items.length})
                  </span>
                </h2>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((v) => (
                  <VendorCard key={v.id} vendor={v} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer nav */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "1.5rem 1.25rem", textAlign: "center" }}>
        <Link href="/" style={{ fontSize: "0.8125rem", color: "var(--muted)", textDecoration: "none" }}>
          ← Terug naar DreamDay Partners
        </Link>
      </div>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/leveranciers/${vendor.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.07)",
          overflow: "hidden",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Photo placeholder */}
        <div
          style={{
            height: "140px",
            background: vendor.isPremium
              ? "linear-gradient(135deg, rgba(196,154,108,0.15), rgba(196,154,108,0.05))"
              : "#f5f5f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {vendor.isPremium && (
            <div
              style={{
                position: "absolute",
                top: "0.625rem",
                right: "0.625rem",
                background: "var(--gradient-primary)",
                borderRadius: "999px",
                padding: "3px 10px",
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Star className="w-2.5 h-2.5" /> PREMIUM
            </div>
          )}
          <span style={{ fontSize: "2.5rem" }}>
            {getCategoryEmoji(vendor.category)}
          </span>
        </div>

        <div style={{ padding: "1rem 1.125rem 1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.25rem" }}>
            {CATEGORY_LABELS[vendor.category] ?? vendor.category}
          </div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", marginBottom: "0.375rem" }}>
            {vendor.name}
          </h3>
          {vendor.city && (
            <div className="flex items-center gap-1" style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
              <MapPin className="w-3 h-3" /> {vendor.city}
            </div>
          )}
          {vendor.description && (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {vendor.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-3" style={{ fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600 }}>
            Bekijk profiel <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    weddingplanner: "💍", fotograaf: "📷", videograaf: "🎥", bloemist: "🌸",
    catering: "🍽️", bakker: "🎂", dj: "🎧", liveband: "🎵",
    ceremoniespreker: "🎤", trouwlocatie: "🏛️", haarstylist: "💄",
    vervoer: "🚗", decoratie: "✨", fotocabine: "📸", overig: "⭐",
  };
  return map[cat] ?? "⭐";
}
