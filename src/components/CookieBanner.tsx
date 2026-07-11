"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "ddp-cookie-consent";

// Lees de huidige keuze uit — te gebruiken door toekomstige analytics-scripts:
// pas laden wanneer getCookieConsent() === "accepted".
export function getCookieConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  function choose(value: "accepted" | "declined") {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="ddp-cookie-banner" role="dialog" aria-label="Cookievoorkeuren">
      <p className="text-sm" style={{ margin: 0, lineHeight: 1.55 }}>
        We gebruiken functionele cookies om je ingelogd te houden. Daarnaast willen we analytische cookies gebruiken om
        te begrijpen hoe DreamDay wordt gebruikt.{" "}
        <Link href="/privacy" style={{ color: "var(--gold)", fontWeight: 600 }}>Lees ons privacybeleid</Link>.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => choose("accepted")}
          className="ddp-btn-gold"
          style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "0.8125rem", padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer" }}
        >
          Accepteren
        </button>
        <button
          onClick={() => choose("declined")}
          style={{ background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.8125rem", padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }}
        >
          Alleen functioneel
        </button>
      </div>
    </div>
  );
}
