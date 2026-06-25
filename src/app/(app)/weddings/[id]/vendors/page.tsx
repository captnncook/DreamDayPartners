"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, Mail, Phone, Star, X, CheckCircle2 } from "lucide-react";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string };
type WeddingVendor = {
  id: string; status: string; portalAccess: boolean; notes?: string;
  vendor: Vendor;
};

const STATUS_COLORS: Record<string, string> = {
  invited: "badge-warning", contacted: "badge-neutral", quote_received: "badge-warning", booked: "badge-info", confirmed: "badge-success", declined: "badge-danger",
};
const STATUS_LABELS: Record<string, string> = {
  invited: "Uitgenodigd", contacted: "Gecontacteerd", quote_received: "Offerte ontvangen", booked: "Geboekt", confirmed: "Bevestigd", declined: "Afgewezen",
};

export default function VendorsPage() {
  const { id } = useParams<{ id: string }>();
  const [weddingVendors, setWeddingVendors] = useState<WeddingVendor[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [wvRes, vRes, wRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors`),
      fetch("/api/vendors"),
      fetch(`/api/weddings/${id}`),
    ]);
    const [wvData, vData, wData] = await Promise.all([wvRes.json(), vRes.json(), wRes.json()]);
    setWeddingVendors(wvData.vendors ?? []);
    setAllVendors(vData.vendors ?? []);
    setIsPremium(wData.wedding?.isPremium ?? false);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const linkedIds = new Set(weddingVendors.map((wv) => wv.vendor.id));
  const available = allVendors.filter((v) => !linkedIds.has(v.id));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendorId) return;
    setSaving(true);
    await fetch(`/api/weddings/${id}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: selectedVendorId, notes: addNotes }),
    });
    setSelectedVendorId("");
    setAddNotes("");
    setShowAdd(false);
    setSaving(false);
    load();
  }

  async function togglePortal(wv: WeddingVendor) {
    await fetch(`/api/weddings/${id}/vendors/${wv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portalAccess: !wv.portalAccess }),
    });
    load();
  }

  async function updateStatus(wv: WeddingVendor, status: string) {
    await fetch(`/api/weddings/${id}/vendors/${wv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function removeVendor(wv: WeddingVendor) {
    if (!confirm(`${wv.vendor.name} verwijderen uit deze bruiloft?`)) return;
    await fetch(`/api/weddings/${id}/vendors/${wv.id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8" style={{ color: "var(--muted)" }}>Laden...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--muted)" }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Leveranciers</h1>
          <button onClick={() => setShowAdd(!showAdd)} className="ddp-btn-primary">
            {showAdd ? "Annuleren" : "+ Leverancier koppelen"}
          </button>
        </div>
      </div>

      {!isPremium && (
        <div className="ddp-card mb-6 flex items-center gap-4" style={{ background: "#fef9ec", border: "1px solid #f5d080" }}>
          <Star className="w-5 h-5 flex-shrink-0" style={{ color: "var(--gold)" }} />
          <div>
            <div className="font-semibold text-sm">Leveranciersportaal is een Premium functie</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Met Premium kunnen leveranciers inloggen en hun eigen draaiboek-items bekijken.
            </div>
          </div>
          <button
            onClick={() => alert("Premium upgrade: neem contact op met DreamDay Partners.")}
            className="ddp-btn-primary ml-auto flex-shrink-0 text-sm"
          >
            Upgrade naar Premium
          </button>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="ddp-card mb-6 space-y-4">
          <h3 className="font-semibold">Leverancier koppelen</h3>
          {available.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Alle leveranciers zijn al gekoppeld.</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium mb-1">Leverancier</label>
                <select
                  required
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <option value="">Kies een leverancier...</option>
                  {available.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Notities (optioneel)</label>
                <input
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="bijv. menu voor 80 personen besproken"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <button type="submit" disabled={saving || !selectedVendorId} className="ddp-btn-primary w-full">
                {saving ? "Koppelen..." : "Leverancier koppelen"}
              </button>
            </>
          )}
        </form>
      )}

      {weddingVendors.length === 0 ? (
        <div className="ddp-card text-center py-16" style={{ color: "var(--muted)" }}>
          <div className="flex justify-center mb-3"><Briefcase className="w-10 h-10" style={{ color: "var(--accent-dark)" }} /></div>
          <h2 className="font-semibold text-lg mb-2">Nog geen leveranciers</h2>
          <p className="text-sm mb-4">Koppel leveranciers aan deze bruiloft</p>
          <button onClick={() => setShowAdd(true)} className="ddp-btn-primary">+ Leverancier koppelen</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {weddingVendors.map((wv) => (
            <div key={wv.id} className="ddp-card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
                  <Briefcase className="w-5 h-5" style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{wv.vendor.name}</h3>
                    {wv.portalAccess && <span className="ddp-badge badge-premium">Portal</span>}
                  </div>
                  <div className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>{wv.vendor.category}</div>
                </div>
                <button onClick={() => removeVendor(wv)} className="text-xs hover:opacity-70 flex-shrink-0" style={{ color: "var(--muted)" }}><X className="w-4 h-4" /></button>
              </div>

              <div className="mt-3">
                <select
                  value={wv.status}
                  onChange={(e) => updateStatus(wv, e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--border)" }}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 space-y-1.5 text-xs" style={{ color: "var(--muted)" }}>
                {wv.vendor.contactPerson && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {wv.vendor.contactPerson}</div>}
                {wv.vendor.email && (
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><a href={`mailto:${wv.vendor.email}`} className="" style={{ color: "var(--primary)" }}>{wv.vendor.email}</a></div>
                )}
                {wv.vendor.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {wv.vendor.phone}</div>}
                {wv.notes && <div className="italic">{wv.notes}</div>}
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
                <Link
                  href={`/weddings/${id}/vendors/${wv.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium flex-1 text-center"
                  style={{ background: "var(--primary)", color: "white", textDecoration: "none" }}
                >
                  Dashboard →
                </Link>
                {isPremium && (
                  <button
                    onClick={() => togglePortal(wv)}
                    className="text-xs px-2 py-1 rounded-md transition-colors flex-shrink-0"
                    style={{
                      background: wv.portalAccess ? "#fde8e8" : "var(--accent)",
                      color: wv.portalAccess ? "var(--danger)" : "var(--primary)",
                    }}
                  >
                    {wv.portalAccess ? "Toegang intrekken" : "Portal"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
