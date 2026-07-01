"use client";

import { useState } from "react";

export default function GeocodeVendors() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; updated: number } | null>(null);

  async function run() {
    if (!confirm("Alle leveranciers zonder coördinaten geocoderen? Dit kan even duren (1 req/sec).")) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/geocode-vendors", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="ddp-card mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Kaartcoördinaten bijwerken</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Geocodeert alle leveranciers met een stad maar zonder coördinaten via OpenStreetMap.
          </p>
          {result && (
            <p className="text-sm mt-1" style={{ color: "var(--success)" }}>
              ✓ {result.updated} van {result.total} leveranciers bijgewerkt.
            </p>
          )}
        </div>
        <button onClick={run} disabled={loading} className="ddp-btn-secondary flex-shrink-0">
          {loading ? "Bezig…" : "Geocoderen"}
        </button>
      </div>
    </div>
  );
}
