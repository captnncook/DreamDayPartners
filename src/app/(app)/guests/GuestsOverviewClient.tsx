"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

type WeddingWithGuestCounts = {
  id: string;
  title: string;
  counts: Record<"confirmed" | "invited" | "no_response" | "declined", number>;
};

export default function GuestsOverviewClient({
  weddings,
  totalGuests,
  totalConfirmed,
}: {
  weddings: WeddingWithGuestCounts[];
  totalGuests: number;
  totalConfirmed: number;
}) {
  const { t } = useLang();
  const tg = t.guests;

  const RSVP_META: Record<string, { label: string; color: string }> = {
    confirmed:   { label: tg.rsvp.confirmed,   color: "var(--foreground)" },
    invited:     { label: tg.rsvp.invited,     color: "var(--muted)" },
    no_response: { label: tg.rsvp.no_response, color: "var(--muted-light)" },
    declined:    { label: tg.rsvp.declined,    color: "var(--muted-light)" },
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tg.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tg.overviewSubtitle.replace("{n}", String(totalGuests)).replace("{m}", String(totalConfirmed))}</p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {tg.overviewNone}
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {weddings.map((w) => (
            <Link key={w.id} href={`/weddings/${w.id}/guests`} className="dash-row" style={{ padding: "1.125rem 0.25rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</div>
                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  {(["confirmed", "invited", "no_response", "declined"] as const).map((status) => {
                    const count = w.counts[status];
                    const meta = RSVP_META[status];
                    return (
                      <span key={status} className="text-xs" style={{ color: meta.color }}>
                        <span style={{ fontWeight: 700 }}>{count}</span>{" "}
                        <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{meta.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{tg.manage}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
