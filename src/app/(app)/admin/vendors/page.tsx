"use client";

import { useState, useEffect, useCallback } from "react";
import { MODULE_LABELS, TOGGLEABLE_MODULE_KEYS, getVendorTypeConfig, type ModuleKey } from "@/lib/vendorTypeConfigs";
import VendorFeatureRequestsPanel from "./VendorFeatureRequestsPanel";

const CATEGORY_MAP: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", catering: "Catering", bakker: "Bruidstaart & Bakker",
  dj: "Muziek & DJ", liveband: "Liveband", ceremoniespreker: "Ceremoniespreker",
  trouwlocatie: "Trouwlocatie", haarstylist: "Hair & make-up", vervoer: "Vervoer",
  decoratie: "Decoratie & Styling", fotocabine: "Fotocabine", overig: "Overig",
};

type Vendor = { id: string; name: string; category: string; city: string | null; isPremium: boolean; userId: string | null; extraModules: string[] };

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  async function toggleExtraModule(v: Vendor, key: string) {
    const next = v.extraModules.includes(key) ? v.extraModules.filter((m) => m !== key) : [...v.extraModules, key];
    setVendors((vs) => vs.map((x) => (x.id === v.id ? { ...x, extraModules: next } : x)));
    await fetch(`/api/admin/vendors/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extraModules: next }),
    });
  }

  async function cleanupDuplicatePhotos() {
    setCleaning(true);
    setCleanupMsg("");
    try {
      const res = await fetch("/api/admin/cleanup-duplicate-photos", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCleanupMsg(
          data.cleared === 0
            ? "Geen gedeelde stockfoto's gevonden."
            : `${data.cleared} leverancier${data.cleared === 1 ? "" : "s"} met een gedeelde stockfoto opgeschoond — toont nu het DreamDay-logo.`
        );
        load();
      } else {
        setCleanupMsg(data.error ?? "Opschonen mislukt");
      }
    } finally {
      setCleaning(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 40));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif mb-1" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>
        Leveranciers
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Markeer een leverancier als "Aanbevolen", ook profielen zonder eigen account (bijv. uit een bulkimport).
      </p>

      <VendorFeatureRequestsPanel />

      <div className="mb-6">
        <button onClick={cleanupDuplicatePhotos} disabled={cleaning} className="ddp-btn-secondary">
          {cleaning ? "Bezig…" : "Gedeelde stockfoto's opschonen"}
        </button>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
          Leveranciers uit een bulkimport delen soms dezelfde standaardfoto per categorie. Deze actie wist die gedeelde
          foto's (unieke, echt geüploade foto's blijven staan) — de leverancier toont daarna het DreamDay-logo.
        </p>
        {cleanupMsg && <p className="text-xs mt-1.5" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{cleanupMsg}</p>}
      </div>

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
            {vendors.map((v) => {
              const config = getVendorTypeConfig(v.category);
              const grantable = TOGGLEABLE_MODULE_KEYS.filter((key) => !(config.modules ?? []).includes(key));
              return (
                <div key={v.id}>
                  <div className="dash-row">
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{v.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {CATEGORY_MAP[v.category] ?? v.category}{v.city ? ` · ${v.city}` : ""}{!v.userId ? " · geen account" : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                      className="text-xs flex-shrink-0"
                      style={{ fontWeight: 600, color: "var(--muted)" }}
                    >
                      Functies {expandedId === v.id ? "▲" : "▼"}
                    </button>
                    <button
                      onClick={() => togglePremium(v)}
                      disabled={busyId === v.id}
                      className="text-sm flex-shrink-0"
                      style={{ fontWeight: 700, color: v.isPremium ? "var(--gold-deep)" : "var(--muted)", opacity: busyId === v.id ? 0.5 : 1 }}
                    >
                      {v.isPremium ? "Aanbevolen ✓" : "Markeer als aanbevolen"}
                    </button>
                  </div>
                  {expandedId === v.id && (
                    <div style={{ padding: "0.75rem 0.5rem 1.25rem", background: "var(--surface-2)" }}>
                      {grantable.length === 0 ? (
                        <p className="text-xs" style={{ color: "var(--muted)" }}>Geen extra functies beschikbaar buiten het standaardpakket van deze categorie.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {grantable.map((key) => (
                            <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={v.extraModules.includes(key)}
                                onChange={() => toggleExtraModule(v, key)}
                              />
                              {MODULE_LABELS[key as ModuleKey] ?? key}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
