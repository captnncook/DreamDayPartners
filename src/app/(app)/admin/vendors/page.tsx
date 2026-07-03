"use client";

import { useState, useEffect, useCallback } from "react";

const CATEGORY_MAP: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", catering: "Catering", bakker: "Bruidstaart & Bakker",
  dj: "Muziek & DJ", liveband: "Liveband", ceremoniespreker: "Ceremoniespreker",
  trouwlocatie: "Trouwlocatie", haarstylist: "Hair & make-up", vervoer: "Vervoer",
  decoratie: "Decoratie & Styling", fotocabine: "Fotocabine", overig: "Overig",
};

type Vendor = { id: string; name: string; category: string; city: string | null; isPremium: boolean; userId: string | null };

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/vendors?${params}`);
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);

  async function togglePremium(v: Vendor) {
    setBusyId(v.id);
    const res = await fetch(`/api/admin/vendors/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: !v.isPremium }),
    });
    if (res.ok) {
      setVendors((vs) => vs.map((x) => (x.id === v.id ? { ...x, isPremium: !v.isPremium } : x)));
    }
    setBusyId(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / 40));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif mb-1" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>
        Leveranciers
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Markeer een leverancier als "Aanbevolen", ook profielen zonder eigen account (bijv. uit een bulkimport).
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Zoek op naam of stad…"
        className="ddp-input mb-4"
        style={{ maxWidth: "360px" }}
      />

      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Laden…</p>
      ) : vendors.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Geen leveranciers gevonden.</p>
      ) : (
        <>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {vendors.map((v) => (
              <div key={v.id} className="dash-row">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{v.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {CATEGORY_MAP[v.category] ?? v.category}{v.city ? ` · ${v.city}` : ""}{!v.userId ? " · geen account" : ""}
                  </div>
                </div>
                <button
                  onClick={() => togglePremium(v)}
                  disabled={busyId === v.id}
                  className="text-sm flex-shrink-0"
                  style={{ fontWeight: 700, color: v.isPremium ? "var(--gold-deep)" : "var(--muted)", opacity: busyId === v.id ? 0.5 : 1 }}
                >
                  {v.isPremium ? "Aanbevolen ✓" : "Markeer als aanbevolen"}
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ fontSize: "0.8125rem", fontWeight: 600, color: page <= 1 ? "var(--muted-light)" : "var(--ink-text)" }}
              >
                ← Vorige
              </button>
              <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Pagina {page} van {totalPages} · {total} totaal</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ fontSize: "0.8125rem", fontWeight: 600, color: page >= totalPages ? "var(--muted-light)" : "var(--ink-text)" }}
              >
                Volgende →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
