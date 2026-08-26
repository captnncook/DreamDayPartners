"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

export default function GeocodeVendors() {
  const { t } = useLang();
  const tg = t.adminTools.geocode;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; updated: number } | null>(null);

  async function run() {
    if (!confirm(tg.confirmMsg)) return;
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
          <h2 className="font-semibold">{tg.title}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {tg.desc}
          </p>
          {result && (
            <p className="text-sm mt-1" style={{ color: "var(--success)" }}>
              {tg.doneMsg.replace("{updated}", String(result.updated)).replace("{total}", String(result.total))}
            </p>
          )}
        </div>
        <button onClick={run} disabled={loading} className="ddp-btn-secondary flex-shrink-0">
          {loading ? tg.busyBtn : tg.runBtn}
        </button>
      </div>
    </div>
  );
}
