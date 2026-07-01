"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";

const SLOTS = [
  { category: "weddingplanner", label: "Weddingplanner" },
  { category: "fotograaf",      label: "Fotograaf" },
  { category: "videograaf",     label: "Videograaf" },
  { category: "trouwlocatie",   label: "Trouwlocatie" },
  { category: "catering",       label: "Catering" },
  { category: "bloemist",       label: "Bloemist" },
  { category: "dj",             label: "DJ / Muziek" },
  { category: "liveband",       label: "Liveband" },
  { category: "haarstylist",    label: "Haarstylist" },
  { category: "visagist",       label: "Visagist" },
  { category: "bakker",         label: "Bruidstaart" },
  { category: "vervoer",        label: "Vervoer" },
  { category: "fotocabine",     label: "Fotocabine" },
  { category: "bar",            label: "Bar / Cocktails" },
  { category: "verhuur",        label: "Verhuur" },
];

type TeamMember = { vendorId: string; name: string; category: string; photo: string | null };

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const SHIELD_PATH = "M50 4 L92 20 L92 62 C92 88 72 108 50 118 C28 108 8 88 8 62 L8 20 Z";

function ShieldCard({
  slot,
  member,
  onRemove,
}: {
  slot: typeof SLOTS[number];
  member: TeamMember | undefined;
  onRemove: (m: TeamMember) => void;
}) {
  const href = member ? `/leveranciers/${member.vendorId}` : `/leveranciers?category=${slot.category}`;
  const label = member ? member.name : slot.label;
  const [firstName, ...rest] = label.split(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "relative" }}>
      {/* Remove button */}
      {member && (
        <button
          onClick={() => onRemove(member)}
          title={`${member.name} verwijderen`}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "var(--danger, #dc2626)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          <X style={{ width: "13px", height: "13px" }} />
        </button>
      )}

      <Link href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
        <div style={{ width: "100%", maxWidth: "180px", position: "relative" }}>
          <svg viewBox="0 0 100 120" style={{ width: "100%", display: "block", filter: member ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none" }}>
            <defs>
              <clipPath id={`shield-${slot.category}`}>
                <path d={SHIELD_PATH} />
              </clipPath>
            </defs>
            <path d={SHIELD_PATH} fill={member ? "#1a1a1a" : "#f4f3f0"} stroke={member ? "var(--primary)" : "#d1cfc8"} strokeWidth="2" />

            {member ? (
              member.photo ? (
                <image
                  href={member.photo}
                  x="8" y="4" width="84" height="114"
                  clipPath={`url(#shield-${slot.category})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : (
                <text x="50" y="68" textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="22" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {initials(member.name)}
                </text>
              )
            ) : (
              <>
                <circle cx="50" cy="62" r="18" fill="none" stroke="#c4c2bb" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="50" y="68" textAnchor="middle" dominantBaseline="middle"
                  fill="#b0ae a7" fontSize="22" fontWeight="300" fontFamily="system-ui, sans-serif">
                  <tspan fill="#aaa9a2">+</tspan>
                </text>
              </>
            )}
          </svg>
        </div>

        <div style={{ textAlign: "center", lineHeight: 1.25 }}>
          {member ? (
            <>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 400 }}>{firstName}</div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--foreground)" }}>
                {rest.join(" ") || firstName}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--primary)", fontWeight: 600, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {slot.label}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 500 }}>{slot.label}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", marginTop: "2px" }}>
                <Plus style={{ width: "11px", height: "11px" }} /> Toevoegen
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function DreamTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmMember, setConfirmMember] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetch("/api/weddings/dream-team")
      .then(r => r.json())
      .then(d => { setTeam(d.team ?? []); setWeddingId(d.weddingId ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleRemoveConfirmed() {
    if (!confirmMember || !weddingId) return;
    setRemoving(true);
    await fetch(`/api/catalogus/${confirmMember.vendorId}/dream-team`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId }),
    });
    setTeam(t => t.filter(m => m.vendorId !== confirmMember.vendorId));
    setConfirmMember(null);
    setRemoving(false);
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      <div className="mb-8">
        <h1 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.04em" }}>Dream Team</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "4px" }}>
          Jullie leveranciers per categorie
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Laden…</p>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem 1.25rem" }}
          className="dream-team-grid"
        >
          {SLOTS.map(slot => (
            <ShieldCard
              key={slot.category}
              slot={slot}
              member={team.find(m => m.category === slot.category)}
              onRemove={setConfirmMember}
            />
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmMember && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !removing && setConfirmMember(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--card, #fff)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Verwijderen uit Dream Team?
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Weet je zeker dat je <strong>{confirmMember.name}</strong> wilt verwijderen uit je Dream Team?
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmMember(null)}
                disabled={removing}
                className="ddp-btn-secondary"
              >
                Annuleren
              </button>
              <button
                onClick={handleRemoveConfirmed}
                disabled={removing}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "8px",
                  background: "var(--danger, #dc2626)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: removing ? "not-allowed" : "pointer",
                  opacity: removing ? 0.6 : 1,
                  fontSize: "0.875rem",
                }}
              >
                {removing ? "Verwijderen…" : "Ja, verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
