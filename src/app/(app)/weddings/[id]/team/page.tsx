"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { User, Mail, Phone } from "lucide-react";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string };
type WeddingVendor = { id: string; status: string; portalAccess: boolean; notes?: string; vendor: Vendor };
type WeddingMember = { id: string; name: string; email: string; role: string };

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const tm = t.team;

  const [weddingVendors, setWeddingVendors] = useState<WeddingVendor[]>([]);
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [wvRes, wRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors`),
      fetch(`/api/weddings/${id}`),
    ]);
    const [wvData, wData] = await Promise.all([wvRes.json(), wRes.json()]);
    setWeddingVendors(wvData.vendors ?? []);
    setWeddingTitle(wData.wedding?.title ?? "");
    // Derive planner/couple members from wedding data
    const w = wData.wedding;
    if (w) {
      const m: WeddingMember[] = [];
      if (w.owner) m.push({ id: w.owner.id, name: w.owner.name, email: w.owner.email, role: w.owner.role });
      (w.teamMembers ?? []).forEach((tm: { user: WeddingMember }) => {
        if (!m.find(x => x.id === tm.user.id)) m.push({ id: tm.user.id, name: tm.user.name, email: tm.user.email, role: tm.user.role });
      });
      setMembers(m);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>{t.common.loading}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
          ← {t.tabs.overview}
        </Link>
        <div className="mt-4">
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tm.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {tm.sub} {weddingTitle}
          </p>
        </div>
      </div>

      {weddingVendors.length === 0 ? (
        <div className="ddp-card text-center py-20" style={{ color: "var(--muted)" }}>
          <h2 className="font-semibold text-lg mb-2">{tm.noVendors}</h2>
          <p className="text-sm mb-6">{tm.noVendorsSub}</p>
          <Link href={`/weddings/${id}/vendors`} className="ddp-btn-primary">
            {tm.goToVendors}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {weddingVendors.map((wv) => {
            const statusLabel = tm.statusLabels[wv.status as keyof typeof tm.statusLabels] ?? wv.status;
            const statusColor =
              ["confirmed", "booked"].includes(wv.status) ? "var(--gold-deep)"
              : wv.status === "quote_received" ? "var(--foreground)"
              : "var(--muted)";

            return (
              <Link
                key={wv.id}
                href={`/weddings/${id}/vendors/${wv.id}`}
                className="ddp-card group hover:shadow-md transition-shadow block"
              >
                {/* Top: icon + name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-serif" style={{ background: "var(--sand)", color: "var(--ink)", fontWeight: 700, fontSize: "1.25rem" }}>
                    {wv.vendor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base truncate" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                      {wv.vendor.name}
                    </h3>
                    <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>
                      {wv.vendor.category}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: statusColor }}>{statusLabel}</span>
                      {wv.portalAccess && (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>{tm.portal}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs border-t pt-3" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
                  {wv.vendor.contactPerson && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {wv.vendor.contactPerson}</div>}
                  {wv.vendor.email && (
                    <div
                      className="flex items-center gap-1 truncate"
                      style={{ color: "var(--primary)" }}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Mail className="w-3 h-3 flex-shrink-0" /> {wv.vendor.email}
                    </div>
                  )}
                  {wv.vendor.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {wv.vendor.phone}</div>}
                  {wv.notes && <div className="italic pt-1">{wv.notes}</div>}
                </div>

                {/* CTA */}
                <div
                  className="mt-3 pt-3 border-t text-xs font-medium flex items-center justify-end gap-1"
                  style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                >
                  {tm.viewDetail} →
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Planner / couple members */}
      {members.length > 0 && (
        <div className="mt-8">
          <h2 className="dash-section-title mb-3">Planningsteam</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => {
              const roleLabel = m.role === "couple" ? "Bruidspaar" : m.role === "planner" ? "Trouwplanner" : m.role === "admin" ? "Beheerder" : "Teamlid";
              return (
                <div key={m.id} className="ddp-card" style={{ padding: "1rem" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{m.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{roleLabel}</div>
                    </div>
                  </div>
                  {m.email && (
                    <div className="mt-2 flex items-center gap-1 text-xs truncate" style={{ color: "var(--primary)" }}>
                      <Mail className="w-3 h-3 flex-shrink-0" /> {m.email}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
