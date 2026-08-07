"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { User, Mail, Phone, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ShieldAvatar from "@/components/ShieldAvatar";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string; userId?: string | null; photoUrl?: string | null };
type WeddingVendor = { id: string; status: string; portalAccess: boolean; notes?: string; vendor: Vendor };
type WeddingMember = { id: string; name: string; email: string; role: string };

// full: bruidspaar/planner/teamlid/weddingplanner-leverancier zien alles en
// beheren de boeking. discovery: overige leveranciers zien op aanvraag wie
// er nog meer werkt (zonder zichzelf) en kunnen contact leggen — alleen
// zolang hun eigen boeking nog "lead" is. none: hun taak is al klaar.
type AccessMode = "full" | "discovery" | "none";

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLang();
  const tm = t.team;

  const [weddingVendors, setWeddingVendors] = useState<WeddingVendor[]>([]);
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessMode>("full");
  const [ownUserId, setOwnUserId] = useState<string | null>(null);
  const [startingWith, setStartingWith] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [wvRes, wRes, meRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors`),
      fetch(`/api/weddings/${id}`),
      fetch("/api/auth/me"),
    ]);
    const [wvData, wData, meData] = await Promise.all([wvRes.json(), wRes.json(), meRes.ok ? meRes.json() : null]);
    const vendors: WeddingVendor[] = wvData.vendors ?? [];
    setWeddingVendors(vendors);
    setWeddingTitle(wData.wedding?.title ?? "");

    const me = meData?.user;
    setOwnUserId(me?.id ?? null);
    if (!me || me.role !== "vendor") {
      setAccess("full");
    } else if (me.vendorType === "weddingplanner") {
      setAccess("full");
    } else {
      const ownBooking = vendors.find((wv) => wv.vendor.userId === me.id);
      setAccess(ownBooking?.status === "lead" ? "discovery" : "none");
    }
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

  async function startConversation(vendorUserId: string) {
    if (startingWith) return;
    setStartingWith(vendorUserId);
    try {
      const res = await fetch("/api/dm/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: vendorUserId }),
      });
      const data = await res.json();
      if (data.conversation?.id) router.push("/dm");
    } finally {
      setStartingWith(null);
    }
  }

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>{t.common.loading}</div>;

  if (access === "none") {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
          ← {t.tabs.overview}
        </Link>
        <p className="text-sm mt-6" style={{ color: "var(--muted)" }}>
          Deze pagina is niet meer beschikbaar zodra je boeking bevestigd is.
        </p>
      </div>
    );
  }

  const visibleVendors = access === "discovery"
    ? weddingVendors.filter((wv) => wv.vendor.userId !== ownUserId)
    : weddingVendors;

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

      {visibleVendors.length === 0 ? (
        <div className="ddp-card text-center py-20" style={{ color: "var(--muted)" }}>
          <h2 className="font-semibold text-lg mb-2">{tm.noVendors}</h2>
          <p className="text-sm mb-6">{tm.noVendorsSub}</p>
          <Link href={`/weddings/${id}/vendors`} className="ddp-btn-primary">
            {tm.goToVendors}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleVendors.map((wv) => {
            const statusLabel = tm.statusLabels[wv.status as keyof typeof tm.statusLabels] ?? wv.status;
            const statusColor =
              ["confirmed", "booked"].includes(wv.status) ? "var(--gold-deep)"
              : wv.status === "quote_received" ? "var(--foreground)"
              : "var(--muted)";
            const isDiscovery = access === "discovery";

            const cardBody = (
              <>
                {/* Top: icon + name */}
                <div className="flex items-start gap-4 mb-4">
                  <ShieldAvatar photoUrl={wv.vendor.photoUrl} clipId={wv.vendor.id} size={44} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base truncate" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                      {wv.vendor.name}
                    </h3>
                    <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>
                      {wv.vendor.category}
                    </div>
                    {!isDiscovery && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: statusColor }}>{statusLabel}</span>
                        {wv.portalAccess && (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>{tm.portal}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs border-t pt-3" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
                  {wv.vendor.contactPerson && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {wv.vendor.contactPerson}</div>}
                  {wv.vendor.email && (
                    <div className="flex items-center gap-1 truncate" style={{ color: "var(--primary)" }}>
                      <Mail className="w-3 h-3 flex-shrink-0" /> {wv.vendor.email}
                    </div>
                  )}
                  {wv.vendor.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {wv.vendor.phone}</div>}
                  {!isDiscovery && wv.notes && <div className="italic pt-1">{wv.notes}</div>}
                </div>
              </>
            );

            if (isDiscovery) {
              const canContact = Boolean(wv.vendor.userId);
              return (
                <div key={wv.id} className="ddp-card">
                  {cardBody}
                  <button
                    onClick={() => canContact && startConversation(wv.vendor.userId!)}
                    disabled={!canContact || startingWith === wv.vendor.userId}
                    className="mt-3 pt-3 border-t text-xs font-medium flex items-center justify-end gap-1 w-full"
                    style={{ borderColor: "var(--border)", color: canContact ? "var(--primary)" : "var(--muted)", background: "none", cursor: canContact ? "pointer" : "default" }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {startingWith === wv.vendor.userId ? "Bezig…" : "Contact opnemen"}
                  </button>
                </div>
              );
            }

            return (
              <Link
                key={wv.id}
                href={`/weddings/${id}/vendors/${wv.id}`}
                className="ddp-card group hover:shadow-md transition-shadow block"
              >
                {cardBody}
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

      {/* Planner / couple members — niet relevant voor de discovery-weergave van leveranciers */}
      {access !== "discovery" && members.length > 0 && (
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
