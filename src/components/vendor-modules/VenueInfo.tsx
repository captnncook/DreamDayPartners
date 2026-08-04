"use client";

import { MapPin } from "lucide-react";

export type VenueInfoData = {
  name: string;
  closingTime: string | null;
  soundLimit: string | null;
  venueFacilities: string[];
  accessibility: string[];
  outdoorCeremonyPossible: boolean;
  setupTime: string | null;
  teardownTime: string | null;
  badWeatherPlan: string | null;
};

// Alleen-lezen: deze gegevens vult de trouwlocatie zelf één keer in op hun
// eigen profiel (met evt. een per-bruiloft afwijkende op-/afbouwtijd) —
// andere leveranciers van dezelfde bruiloft (DJ, band, cateraar...) zien
// ze hier zonder er apart naar te hoeven vragen.
export default function VenueInfo({ venue }: { venue: VenueInfoData }) {
  const hasFacts = venue.closingTime || venue.soundLimit || venue.setupTime || venue.teardownTime || venue.badWeatherPlan || venue.venueFacilities.length > 0 || venue.accessibility.length > 0;

  return (
    <div className="ddp-card">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <div>
          <h3 className="font-semibold text-sm">Locatiegegevens — {venue.name}</h3>
          <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1px" }}>Ingevuld door de trouwlocatie, geldt voor alle leveranciers</p>
        </div>
      </div>

      {hasFacts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2" style={{ fontSize: "0.875rem" }}>
          {venue.setupTime && (
            <div><span style={{ color: "var(--muted)" }}>Opbouwen vanaf:</span> {venue.setupTime}</div>
          )}
          {venue.teardownTime && (
            <div><span style={{ color: "var(--muted)" }}>Afbouwen tot:</span> {venue.teardownTime}</div>
          )}
          {venue.closingTime && (
            <div><span style={{ color: "var(--muted)" }}>Sluitingstijd:</span> {venue.closingTime}</div>
          )}
          {venue.soundLimit && (
            <div><span style={{ color: "var(--muted)" }}>Geluidslimiet:</span> {venue.soundLimit}</div>
          )}
          <div><span style={{ color: "var(--muted)" }}>Buitenceremonie mogelijk:</span> {venue.outdoorCeremonyPossible ? "Ja" : "Nee"}</div>
          {venue.venueFacilities.length > 0 && (
            <div className="sm:col-span-2"><span style={{ color: "var(--muted)" }}>Voorzieningen:</span> {venue.venueFacilities.join(", ")}</div>
          )}
          {venue.accessibility.length > 0 && (
            <div className="sm:col-span-2"><span style={{ color: "var(--muted)" }}>Toegankelijkheid:</span> {venue.accessibility.join(", ")}</div>
          )}
          {venue.badWeatherPlan && (
            <div className="sm:col-span-2"><span style={{ color: "var(--muted)" }}>Slechtweer-scenario:</span> {venue.badWeatherPlan}</div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>
          De trouwlocatie heeft deze gegevens nog niet ingevuld op hun profiel.
        </p>
      )}
    </div>
  );
}
