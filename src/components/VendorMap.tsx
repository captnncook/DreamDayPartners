"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet's default icon path broken by webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Vendor = {
  id: string;
  name: string;
  category: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  isPremium: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  weddingplanner: "Weddingplanner", fotograaf: "Fotograaf", videograaf: "Videograaf",
  bloemist: "Bloemist", catering: "Catering", bakker: "Bruidstaart & Bakker",
  dj: "DJ", liveband: "Liveband & Muziek", ceremoniespreker: "Ceremoniespreker",
  trouwlocatie: "Trouwlocatie", haarstylist: "Haar & Make-up", vervoer: "Vervoer",
  decoratie: "Decoratie & Styling", fotocabine: "Fotocabine", overig: "Overig",
};

interface Props {
  vendors: Vendor[];
}

export default function VendorMap({ vendors }: Props) {
  const mapped = vendors.filter((v) => v.latitude != null && v.longitude != null);

  useEffect(() => {
    // Ensure leaflet CSS marker fix is applied after mount
  }, []);

  if (mapped.length === 0) {
    return (
      <div style={{ height: "480px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-blush-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1rem", opacity: 0.4, display: "flex", justifyContent: "center" }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg></div>
          <p style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>
            Nog geen leveranciers met locatie beschikbaar.
          </p>
          <p style={{ color: "var(--muted-light)", fontSize: "0.8125rem", marginTop: "0.375rem" }}>
            Leveranciers verschijnen op de kaart zodra zij hun stad hebben ingevuld.
          </p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [
    mapped.reduce((s, v) => s + v.latitude!, 0) / mapped.length,
    mapped.reduce((s, v) => s + v.longitude!, 0) / mapped.length,
  ];

  return (
    <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", height: "480px" }}>
      <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map((v) => (
          <Marker key={v.id} position={[v.latitude!, v.longitude!]} icon={icon}>
            <Popup>
              <div style={{ minWidth: "160px" }}>
                {v.isPremium && (
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", color: "#7a5c1a", marginBottom: "4px" }}>
                    AANBEVOLEN
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>{v.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "6px" }}>
                  {CATEGORY_LABELS[v.category] ?? v.category}
                  {v.city && ` · ${v.city}`}
                </div>
                <Link
                  href={`/leveranciers/${v.id}`}
                  style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1F2428", textDecoration: "none" }}
                >
                  Bekijk profiel →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
