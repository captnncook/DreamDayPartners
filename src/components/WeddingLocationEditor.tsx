"use client";

import { useState, useRef, useEffect } from "react";

const PROVINCES = [
  "Groningen", "Friesland", "Drenthe", "Overijssel", "Flevoland", "Gelderland",
  "Utrecht", "Noord-Holland", "Zuid-Holland", "Zeeland", "Noord-Brabant", "Limburg",
];

export default function WeddingLocationEditor({
  weddingId,
  initialCity,
  initialProvince,
}: {
  weddingId: string;
  initialCity: string;
  initialProvince: string;
}) {
  const [city, setCity] = useState(initialCity);
  const [province, setProvince] = useState(initialProvince);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(nextCity: string, nextProvince: string) {
    setStatus("saving");
    await fetch(`/api/weddings/${weddingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationCity: nextCity, province: nextProvince }),
    });
    setStatus("saved");
  }

  function scheduleSave(nextCity: string, nextProvince: string) {
    setStatus("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(nextCity, nextProvince), 700);
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        Zodat we leveranciers bij jullie in de buurt bovenaan kunnen tonen.
      </p>
      <div className="flex flex-col gap-2">
        <input
          value={city}
          onChange={(e) => { setCity(e.target.value); scheduleSave(e.target.value, province); }}
          placeholder="Woonplaats"
          className="ddp-input"
          style={{ fontSize: "var(--text-md)" }}
        />
        <select
          value={province}
          onChange={(e) => { setProvince(e.target.value); scheduleSave(city, e.target.value); }}
          className="ddp-input"
          style={{ fontSize: "var(--text-md)" }}
        >
          <option value="">Kies provincie…</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="text-xs mt-1.5" style={{ color: "var(--muted-light)" }}>
        {status === "saving" ? "Opslaan…" : status === "saved" ? "Opgeslagen" : ""}
      </div>
    </div>
  );
}
