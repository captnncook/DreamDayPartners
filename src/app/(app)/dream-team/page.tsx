"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

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

// Shield SVG path (centered in 100x120 viewBox)
const SHIELD_PATH = "M50 4 L92 20 L92 62 C92 88 72 108 50 118 C28 108 8 88 8 62 L8 20 Z";

function ShieldCard({ slot, member }: { slot: typeof SLOTS[number]; member: TeamMember | undefined }) {
  const href = member ? `/leveranciers/${member.vendorId}` : `/leveranciers?category=${slot.category}`;
  const label = member ? member.name : slot.label;
  const [firstName, ...rest] = label.split(" ");

  return (
    <Link href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "100%", maxWidth: "180px", position: "relative" }}>
        <svg viewBox="0 0 100 120" style={{ width: "100%", display: "block", filter: member ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none" }}>
          <defs>
            <clipPath id={`shield-${slot.category}`}>
              <path d={SHIELD_PATH} />
            </clipPath>
          </defs>
          {/* Shield base */}
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
              /* Initialen */
              <text x="50" y="68" textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="22" fontWeight="700" fontFamily="system-ui, sans-serif">
                {initials(member.name)}
              </text>
            )
          ) : (
            /* Plus icon */
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

      {/* Name */}
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
  );
}

export default function DreamTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weddings/dream-team")
      .then(r => r.json())
      .then(d => { setTeam(d.team ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2rem 1.25rem",
        }}
          className="dream-team-grid"
        >
          {SLOTS.map(slot => (
            <ShieldCard key={slot.category} slot={slot} member={team.find(m => m.category === slot.category)} />
          ))}
        </div>
      )}
    </div>
  );
}
