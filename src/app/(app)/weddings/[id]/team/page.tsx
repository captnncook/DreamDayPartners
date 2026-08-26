"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
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
  const [canInvite, setCanInvite] = useState(false);
  const [invites, setInvites] = useState<{ id: string; email: string; acceptedAt: string | null }[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

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
    setCanInvite(!!me && ["couple", "planner", "admin"].includes(me.role));
    if (me && ["couple", "planner", "admin"].includes(me.role)) {
      fetch(`/api/weddings/${id}/team-invites`).then(r => r.json()).then(d => setInvites(d.invites ?? []));
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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteBusy(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await fetch(`/api/weddings/${id}/team-invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Uitnodigen mislukt"); return; }
      setInviteSuccess(data.directlyLinked
        ? "Deze persoon had al een account en is direct als teamlid gekoppeld."
        : `Uitnodiging verstuurd naar ${inviteEmail}.`
      );
      setInviteEmail("");
      setShowInviteForm(false);
      load();
    } finally {
      setInviteBusy(false);
    }
  }

  async function cancelInvite(inviteId: string) {
    await fetch(`/api/weddings/${id}/team-invites`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  }

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
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tm.title}</h1>
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
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {visibleVendors.map((wv) => {
            const statusLabel = tm.statusLabels[wv.status as keyof typeof tm.statusLabels] ?? wv.status;
            const statusColor =
              ["confirmed", "booked"].includes(wv.status) ? "var(--gold-deep)"
              : wv.status === "quote_received" ? "var(--foreground)"
              : "var(--muted)";
            const isDiscovery = access === "discovery";
            const canContact = Boolean(wv.vendor.userId);

            const rowBody = (
              <>
                <ShieldAvatar photoUrl={wv.vendor.photoUrl} clipId={wv.vendor.id} size={40} />
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <h3 className="font-serif" style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--foreground)" }}>
                    {wv.vendor.name}
                  </h3>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", textTransform: "capitalize", marginTop: "1px" }}>
                    {wv.vendor.category}
                    {wv.vendor.contactPerson && ` · ${wv.vendor.contactPerson}`}
                  </div>
                  {(wv.vendor.email || wv.vendor.phone) && (
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px", display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                      {wv.vendor.email && <span style={{ color: "var(--primary)" }}>{wv.vendor.email}</span>}
                      {wv.vendor.phone && <span>{wv.vendor.phone}</span>}
                    </div>
                  )}
                  {!isDiscovery && wv.notes && <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontStyle: "italic", marginTop: "2px" }}>{wv.notes}</div>}
                  {!isDiscovery && (
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: statusColor }}>{statusLabel}</span>
                      {wv.portalAccess && (
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>{tm.portal}</span>
                      )}
                    </div>
                  )}
                </div>
              </>
            );

            if (isDiscovery) {
              return (
                <div key={wv.id} className="dash-row" style={{ flexWrap: "wrap" }}>
                  {rowBody}
                  <button
                    onClick={() => canContact && startConversation(wv.vendor.userId!)}
                    disabled={!canContact || startingWith === wv.vendor.userId}
                    style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: canContact ? "var(--gold-deep)" : "var(--muted)", background: "none", border: "none", cursor: canContact ? "pointer" : "default", flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    {startingWith === wv.vendor.userId ? "Bezig…" : "Contact opnemen"}
                  </button>
                </div>
              );
            }

            return (
              <Link key={wv.id} href={`/weddings/${id}/vendors/${wv.id}`} className="dash-row" style={{ flexWrap: "wrap" }}>
                {rowBody}
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gold-deep)", flexShrink: 0, whiteSpace: "nowrap" }}>
                  {tm.viewDetail} →
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Planner / couple members — niet relevant voor de discovery-weergave van leveranciers */}
      {access !== "discovery" && (members.length > 0 || canInvite) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="dash-section-title" style={{ marginBottom: 0 }}>Planningsteam</h2>
            {canInvite && (
              <button onClick={() => setShowInviteForm(v => !v)} className="ddp-btn-secondary" style={{ fontSize: "var(--text-base)", padding: "0.375rem 0.875rem" }}>
                + Teamlid uitnodigen
              </button>
            )}
          </div>

          {canInvite && showInviteForm && (
            <form onSubmit={handleInvite} className="ddp-card mb-4" style={{ padding: "1.25rem", display: "flex", gap: "var(--space-5)", flexWrap: "wrap", alignItems: "flex-end" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted)", width: "100%", margin: "0 0 0.25rem" }}>
                Een teamlid krijgt met een eigen account dezelfde toegang als jullie zelf: gasten, budget, taken,
                draaiboek en berichten met leveranciers kunnen net zo goed door hen bekeken én bewerkt worden.
              </p>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                  E-mailadres van het teamlid
                </label>
                <input
                  type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="bijv. moeder@email.nl" className="ddp-input"
                />
              </div>
              <button type="submit" disabled={inviteBusy} className="ddp-btn-primary" style={{ flexShrink: 0 }}>
                {inviteBusy ? "Versturen…" : "Uitnodiging versturen"}
              </button>
              {inviteError && <p style={{ fontSize: "var(--text-base)", color: "var(--danger, #b3261e)", width: "100%", margin: 0 }}>{inviteError}</p>}
            </form>
          )}
          {inviteSuccess && !showInviteForm && (
            <p style={{ fontSize: "var(--text-base)", color: "var(--gold-deep)", marginBottom: "var(--space-6)" }}>{inviteSuccess}</p>
          )}

          {canInvite && invites.filter(i => !i.acceptedAt).length > 0 && (
            <div className="mb-4">
              <p className="ddp-section-label" style={{ marginBottom: "var(--space-2)" }}>Openstaande uitnodigingen</p>
              {invites.filter(i => !i.acceptedAt).map(i => (
                <div key={i.id} className="dash-row" style={{ justifyContent: "space-between" }}>
                  <span>{i.email}</span>
                  <button onClick={() => cancelInvite(i.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                    Intrekken
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--border)" }}>
            {members.map(m => {
              const roleLabel = m.role === "couple" ? "Bruidspaar" : m.role === "planner" ? "Trouwplanner" : m.role === "admin" ? "Beheerder" : "Teamlid";
              return (
                <div key={m.id} className="dash-row">
                  <div className="font-serif" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: "var(--text-lg)", background: "var(--gold)", color: "var(--ink)" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-serif" style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--foreground)" }}>{m.name}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "1px" }}>
                      {roleLabel}{m.email && ` · ${m.email}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
