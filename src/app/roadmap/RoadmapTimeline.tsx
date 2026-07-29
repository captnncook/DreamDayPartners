"use client";

import { useState } from "react";

type Status = "done" | "current" | "upcoming";

type Milestone = {
  period: string;
  title: string;
  description: string;
  status: Status;
};

// Richtdatums zijn indicatief en kunnen opschuiven — de kern (bèta, veiligheidscheck,
// lancering) is de vaste volgorde, de exacte week hangt af van wat de bèta oplevert.
const MILESTONES: Milestone[] = [
  {
    period: "Afgerond",
    title: "Kernplatform",
    description: "Draaiboek, gastenlijst, budget, berichten en het Dream Team waarin bruidspaar, planner en leveranciers samenwerken.",
    status: "done",
  },
  {
    period: "Afgerond",
    title: "Abonnementen & betalingen",
    description: "Premium-abonnement voor leveranciers via Stripe, maandelijks opzegbaar, met facturatieportaal.",
    status: "done",
  },
  {
    period: "Nu bezig",
    title: "Leveranciers-catalogus vullen",
    description: "Eerste leveranciers per categorie en regio toevoegen, zodat bruidsparen bij lancering echt iets te kiezen hebben.",
    status: "current",
  },
  {
    period: "Komende weken",
    title: "Besloten bèta",
    description: "Een kleine groep weddingplanners, bruidsparen en leveranciers gebruikt het platform in het echt. We verzamelen feedback en lossen knelpunten op voordat de deuren opengaan.",
    status: "upcoming",
  },
  {
    period: "Voor lancering",
    title: "Veiligheid & betrouwbaarheid",
    description: "AVG-check, back-ups en monitoring, en een laatste beveiligingsreview voordat we met echte gegevens live gaan.",
    status: "upcoming",
  },
  {
    period: "Doel: Q4 2026",
    title: "Publieke lancering",
    description: "De website en het dashboard gaan open voor iedereen — bruidsparen, weddingplanners en leveranciers.",
    status: "upcoming",
  },
];

function statusColor(status: Status) {
  if (status === "done") return "var(--gold-deep)";
  if (status === "current") return "var(--gold-deep)";
  return "var(--muted-light)";
}

export default function RoadmapTimeline() {
  const [active, setActive] = useState<number>(MILESTONES.findIndex((m) => m.status === "current"));

  return (
    <div>
      {/* Desktop: horizontale tijdlijn */}
      <div className="hidden md:block" style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <div style={{ position: "relative", minWidth: "960px", padding: "2.5rem 1rem 0" }}>
          <div style={{ position: "absolute", left: "1rem", right: "1rem", top: "calc(2.5rem + 7px)", height: "2px", background: "var(--border)" }} />
          <div
            style={{
              position: "absolute", left: "1rem", top: "calc(2.5rem + 7px)", height: "2px",
              background: "var(--gold-deep)",
              width: `calc((100% - 2rem) * ${active / (MILESTONES.length - 1)})`,
              transition: "width 200ms var(--ease-out)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {MILESTONES.map((m, i) => (
              <button
                key={m.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", width: `${100 / MILESTONES.length}%`, padding: 0 }}
              >
                <span
                  style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: i <= active ? statusColor(m.status) : "var(--background)",
                    border: `2px solid ${statusColor(m.status)}`,
                    transition: "transform 140ms var(--ease-out)",
                    transform: active === i ? "scale(1.25)" : "scale(1)",
                  }}
                />
                <span
                  className="font-serif"
                  style={{
                    marginTop: "0.9rem", fontSize: "0.9rem", fontWeight: 700, textAlign: "center",
                    color: active === i ? "var(--foreground)" : "var(--muted)",
                  }}
                >
                  {m.title}
                </span>
                <span style={{ marginTop: "2px", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: statusColor(m.status) }}>
                  {m.period}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 ddp-card" style={{ minHeight: "110px" }}>
          <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.65 }}>
            {MILESTONES[active].description}
          </p>
        </div>
      </div>

      {/* Mobiel: verticale lijst, alles direct zichtbaar (geen hover) */}
      <div className="md:hidden">
        <div style={{ borderLeft: "2px solid var(--border)", marginLeft: "8px" }}>
          {MILESTONES.map((m) => (
            <div key={m.title} style={{ position: "relative", padding: "0 0 1.75rem 1.5rem" }}>
              <span
                style={{
                  position: "absolute", left: "-9px", top: "2px",
                  width: 16, height: 16, borderRadius: "50%",
                  background: m.status === "upcoming" ? "var(--background)" : statusColor(m.status),
                  border: `2px solid ${statusColor(m.status)}`,
                }}
              />
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: statusColor(m.status) }}>
                {m.period}
              </span>
              <h3 className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)", marginTop: "2px" }}>
                {m.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, marginTop: "0.25rem" }}>
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
