"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Search } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { formatDateRange } from "@/lib/dateRange";

type Vendor = { id: string; name: string; category: string; email?: string; phone?: string; contactPerson?: string };
type WeddingVendor = {
  id: string; status: string; portalAccess: boolean; notes?: string; specificDate?: string | null;
  vendor: Vendor;
};

const STATUS_LABELS: Record<string, string> = {
  invited: "Uitgenodigd", contacted: "Gecontacteerd", quote_received: "Offerte ontvangen", booked: "Geboekt", confirmed: "Bevestigd", declined: "Afgewezen",
};

export default function VendorsPage() {
  const { id } = useParams<{ id: string }>();
  const [weddingVendors, setWeddingVendors] = useState<WeddingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Vendor[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [addNotes, setAddNotes] = useState("");
  const [addSpecificDate, setAddSpecificDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [weddingDates, setWeddingDates] = useState<{ date: string; endDate: string | null } | null>(null);
  const searchSeq = useRef(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const load = useCallback(async () => {
    const [wvRes, wRes] = await Promise.all([
      fetch(`/api/weddings/${id}/vendors`),
      fetch(`/api/weddings/${id}`),
    ]);
    const wvData = await wvRes.json();
    setWeddingVendors(wvData.vendors ?? []);
    const wData = await wRes.json().catch(() => null);
    if (wData?.wedding) {
      setIsMultiDay(Boolean(wData.wedding.endDate));
      setWeddingDates({ date: wData.wedding.date, endDate: wData.wedding.endDate ?? null });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const linkedIds = new Set(weddingVendors.map((wv) => wv.vendor.id));

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/vendors?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json().catch(() => ({ vendors: [] }));
      if (seq !== searchSeq.current) return;
      setSearchResults((data.vendors ?? []).filter((v: Vendor) => !linkedIds.has(v.id)));
      setSearching(false);
      setHighlightedIndex(-1);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (highlightedIndex >= 0) optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  function pickVendor(v: Vendor) {
    setSelectedVendor(v);
    setQuery(`${v.name} · ${v.category}`);
    setShowResults(false);
    setHighlightedIndex(-1);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showResults || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? searchResults.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        e.preventDefault();
        pickVendor(searchResults[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      setHighlightedIndex(-1);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor) return;
    setSaving(true);
    setAddError("");
    const res = await fetch(`/api/weddings/${id}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: selectedVendor.id, notes: addNotes, specificDate: addSpecificDate || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setAddError(data?.error || "Koppelen is niet gelukt. Probeer het opnieuw.");
      return;
    }
    setSelectedVendor(null);
    setQuery("");
    setAddNotes("");
    setAddSpecificDate("");
    setShowAdd(false);
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

  async function updateSpecificDate(wv: WeddingVendor, specificDate: string) {
    await fetch(`/api/weddings/${id}/vendors/${wv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specificDate: specificDate || null }),
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
        <Link href={`/weddings/${id}`} className="text-sm" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>← Terug</Link>
        <div className="flex items-center justify-between mt-4">
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Leveranciers</h1>
          <button onClick={() => setShowAdd(!showAdd)} className="ddp-btn-primary">
            {showAdd ? "Annuleren" : "+ Leverancier koppelen"}
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="ddp-card mb-6 space-y-4">
          <h3 className="font-semibold">Leverancier koppelen</h3>
          {addError && (
            <p className="text-sm" style={{ color: "var(--danger)", background: "var(--danger-bg)", borderRadius: "8px", padding: "0.625rem 0.875rem" }}>
              {addError}
            </p>
          )}
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Staat een leverancier hier niet tussen? Zoek en nodig ze uit vanaf hun profiel in de{" "}
            <Link href="/leveranciers" className="underline" style={{ color: "var(--gold-deep)" }}>catalogus</Link>.
          </p>
          <div>
            <label className="block text-xs font-medium mb-1">Leverancier</label>
            <div className="ddp-search" style={{ position: "relative" }}>
              <Search />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedVendor(null);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                onKeyDown={onSearchKeyDown}
                placeholder="Typ een naam om te zoeken..."
                autoComplete="off"
                role="combobox"
                aria-expanded={showResults && searchResults.length > 0}
                aria-controls="vendor-search-listbox"
                aria-autocomplete="list"
                aria-activedescendant={highlightedIndex >= 0 ? `vendor-option-${highlightedIndex}` : undefined}
              />
              {showResults && query.trim() && (
                <div
                  id="vendor-search-listbox"
                  role="listbox"
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxHeight: "260px", overflowY: "auto",
                  }}
                >
                  {searching ? (
                    <div className="text-sm" style={{ padding: "0.625rem 0.875rem", color: "var(--muted)" }}>Zoeken...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-sm" style={{ padding: "0.625rem 0.875rem", color: "var(--muted)" }}>Geen leveranciers gevonden.</div>
                  ) : (
                    searchResults.map((v, i) => (
                      <button
                        key={v.id}
                        id={`vendor-option-${i}`}
                        ref={(el) => { optionRefs.current[i] = el; }}
                        role="option"
                        aria-selected={highlightedIndex === i}
                        type="button"
                        onClick={() => pickVendor(v)}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        className="text-sm"
                        style={{
                          display: "block", width: "100%", textAlign: "left", padding: "0.625rem 0.875rem",
                          background: highlightedIndex === i ? "var(--accent)" : "none", border: "none", cursor: "pointer", color: "var(--foreground)",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {v.name} <span style={{ color: "var(--muted)" }}>· {v.category}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {selectedVendor?.category === "weddingplanner" && (
            <p className="text-xs" style={{ color: "var(--muted)", background: "var(--sand)", borderLeft: "3px solid var(--gold)", padding: "0.625rem 0.875rem", borderRadius: "0 8px 8px 0" }}>
              Let op: als leverancier gekoppeld kan {selectedVendor.name} alleen hun eigen leveranciersportaal zien
              (betaalstatus, eigen tijdlijn) — geen taken, gasten of budget bewerken. Wil je dat {selectedVendor.name}
              namens jullie kan meebeheren, nodig diegene dan uit als teamlid via{" "}
              <Link href={`/weddings/${id}/team`} className="underline" style={{ color: "var(--gold-deep)" }}>het Team-tabblad</Link>.
            </p>
          )}
          {isMultiDay && weddingDates && (
            <div>
              <label className="block text-xs font-medium mb-1">Werkt op specifieke dag (optioneel)</label>
              <DatePicker
                value={addSpecificDate}
                onChange={setAddSpecificDate}
                min={weddingDates.date}
                max={weddingDates.endDate ?? undefined}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)" }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Jullie bruiloft duurt meerdere dagen ({formatDateRange(new Date(weddingDates.date), weddingDates.endDate ? new Date(weddingDates.endDate) : null)}).
                Vul dit in als deze leverancier niet op alle dagen werkt.
              </p>
            </div>
          )}
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
          <button type="submit" disabled={saving || !selectedVendor} className="ddp-btn-primary w-full">
            {saving ? "Koppelen..." : "Leverancier koppelen"}
          </button>
        </form>
      )}

      {weddingVendors.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          <h2 className="font-serif" style={{ fontWeight: 700, fontSize: "var(--text-2xl)", marginBottom: "var(--space-3)", color: "var(--foreground)" }}>Nog geen leveranciers</h2>
          <p className="text-sm mb-4">Koppel leveranciers aan deze bruiloft</p>
          <button onClick={() => setShowAdd(true)} className="ddp-btn-primary">+ Leverancier koppelen</button>
        </div>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {weddingVendors.map((wv) => (
            <div key={wv.id} className="dash-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <div className="font-serif" style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--sand)", color: "var(--ink)", fontWeight: 700, fontSize: "var(--text-lg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {wv.vendor.name.charAt(0)}
              </div>

              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/weddings/${id}/vendors/${wv.id}`} className="font-serif" style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--foreground)", textDecoration: "none" }}>
                    {wv.vendor.name}
                  </Link>
                  {wv.portalAccess && <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-deep)" }}>Portal</span>}
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", textTransform: "capitalize", marginTop: "1px" }}>
                  {wv.vendor.category}
                  {wv.vendor.contactPerson && ` · ${wv.vendor.contactPerson}`}
                </div>
                {(wv.vendor.email || wv.vendor.phone) && (
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", marginTop: "2px", display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                    {wv.vendor.email && <a href={`mailto:${wv.vendor.email}`} style={{ color: "var(--primary)" }}>{wv.vendor.email}</a>}
                    {wv.vendor.phone && <span>{wv.vendor.phone}</span>}
                  </div>
                )}
                {wv.notes && <div style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontStyle: "italic", marginTop: "2px" }}>{wv.notes}</div>}
                {isMultiDay && weddingDates && (
                  <div style={{ marginTop: "var(--space-3)", maxWidth: "220px" }}>
                    <label className="block" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--muted)", marginBottom: "2px" }}>Werkt op</label>
                    <DatePicker
                      value={wv.specificDate ?? ""}
                      onChange={(v) => updateSpecificDate(wv, v)}
                      min={weddingDates.date}
                      max={weddingDates.endDate ?? undefined}
                      placeholder="Alle dagen"
                      className="w-full border rounded-lg px-2 py-1.5 text-xs"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexShrink: 0, flexWrap: "wrap" }}>
                <select
                  value={wv.status}
                  onChange={(e) => updateStatus(wv, e.target.value)}
                  className="rounded-lg px-2 py-1.5"
                  style={{ borderColor: "var(--border)", border: "1px solid var(--border)", fontSize: "var(--text-sm)", background: "var(--surface)" }}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button
                  onClick={() => togglePortal(wv)}
                  style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: wv.portalAccess ? "var(--muted)" : "var(--gold-deep)", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {wv.portalAccess ? "Toegang intrekken" : "Portal geven"}
                </button>
                <button onClick={() => removeVendor(wv)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
