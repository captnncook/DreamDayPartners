"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import BulkVendorImport from "./BulkVendorImport";
import GeocodeVendors from "./GeocodeVendors";
import DangerReset from "./DangerReset";
import AdminNotes from "@/components/AdminNotes";

type WeddingRow = {
  id: string;
  title: string;
  weddingCode: string;
  ownerName: string;
  guestCount: number;
  vendorCount: number;
};

export default function AdminOverviewClient({
  userCount,
  weddingCount,
  vendorCount,
  weddings,
}: {
  userCount: number;
  weddingCount: number;
  vendorCount: number;
  weddings: WeddingRow[];
}) {
  const { t } = useLang();
  const ta = t.admin;
  const [notesOpenId, setNotesOpenId] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{ta.pageTitle}</h1>
        <div className="flex gap-6">
          {[
            { val: userCount, label: ta.users },
            { val: weddingCount, label: ta.weddings },
            { val: vendorCount, label: ta.vendors },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <span className="font-serif" style={{ fontSize: "var(--text-4xl)", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{val}</span>
              <span style={{ display: "block", fontSize: "var(--text-2xs)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "1px" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <BulkVendorImport />
      </div>
      <GeocodeVendors />
      <DangerReset />

      <div>
        <h2 className="dash-section-title mb-1">{ta.weddings}</h2>
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {weddings.map((w) => (
            <div key={w.id}>
              <div className="dash-row">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm truncate" style={{ fontWeight: 700 }}>{w.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {w.weddingCode} · {w.ownerName}
                  </div>
                </div>
                <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--muted)" }}>
                  <div>{ta.guestsCount.replace("{n}", String(w.guestCount))}</div>
                  <div>{ta.vendorsCountLabel.replace("{n}", String(w.vendorCount))}</div>
                </div>
                <button
                  onClick={() => setNotesOpenId(notesOpenId === w.id ? null : w.id)}
                  title="Interne notities"
                  className="p-1.5 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0"
                  style={{ color: notesOpenId === w.id ? "var(--foreground)" : "var(--muted)" }}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
              {notesOpenId === w.id && (
                <div className="pb-3">
                  <AdminNotes targetType="wedding" targetId={w.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
