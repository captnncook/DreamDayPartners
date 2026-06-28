"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, CheckCircle } from "lucide-react";

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

export default function DreamTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weddings/dream-team")
      .then(r => r.json())
      .then(d => { setTeam(d.team ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filled = team.length;
  const total = SLOTS.length;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.04em" }}>Dream Team</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "4px" }}>
          Overzicht van jullie leveranciers per categorie
        </p>
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {SLOTS.map(({ category, label }) => {
          const member = team.find(m => m.category === category);
          return (
            <div key={category} className="ddp-card" style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Avatar */}
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                background: member ? "var(--primary)" : "var(--accent)",
                border: member ? "none" : "1.5px dashed var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative",
              }}>
                {member ? (
                  member.photo ? (
                    <Image src={member.photo} alt={member.name} fill style={{ objectFit: "cover" }} sizes="44px" />
                  ) : (
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>{initials(member.name)}</span>
                  )
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>?</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1px" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: member ? "var(--foreground)" : "var(--muted)" }}>
                  {member ? member.name : "Nog niet gekozen"}
                </div>
              </div>

              {/* Action */}
              {member ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  <Link
                    href={`/leveranciers/${member.vendorId}`}
                    style={{ fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                  >
                    Bekijken →
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/leveranciers?category=${category}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)",
                    background: "var(--accent)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "0.35rem 0.75rem", textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Kiezen
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
