"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

type TeamMember = { id: string; user: { name: string } };
type WeddingRow = {
  id: string;
  title: string;
  venue: string | null;
  date: Date | string;
  status: string;
  weddingCode: string;
  teamMembers: TeamMember[];
  _count: { guests: number; tasks: number; vendors: number };
};

export default function WeddingsOverviewClient({ weddings }: { weddings: WeddingRow[] }) {
  const { t } = useLang();
  const tw = t.weddingsOverview;
  const STATUS_META: Record<string, { label: string; color: string }> = {
    planning: { label: tw.statusLabels.planning, color: "var(--muted)" },
    intake: { label: tw.statusLabels.intake, color: "var(--muted)" },
    execution: { label: tw.statusLabels.execution, color: "var(--gold-deep)" },
    completed: { label: tw.statusLabels.completed, color: "var(--muted-light)" },
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tw.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tw.subtitle.replace("{n}", String(weddings.length)).replace("{s}", weddings.length !== 1 ? "en" : "")}</p>
        </div>
        <Link href="/weddings/new" className="ddp-btn-primary">{tw.newWedding}</Link>
      </div>

      {weddings.length === 0 ? (
        <div className="text-center py-20" style={{ borderTop: "1px solid var(--border)" }}>
          <h2 className="font-serif" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--foreground)" }}>{tw.noneTitle}</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{tw.noneHint}</p>
          <Link href="/weddings/new" className="ddp-btn-primary">{tw.createFirst}</Link>
        </div>
      ) : (
        <div>
          {weddings.map((w) => {
            const days = Math.ceil((new Date(w.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isPast = days < 0;
            const urgent = days >= 0 && days <= 14;
            const status = STATUS_META[w.status] ?? { label: w.status, color: "var(--muted)" };
            const day = new Date(w.date).getDate();
            const month = new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(w.date));
            const year = new Date(w.date).getFullYear();

            return (
              <Link
                key={w.id}
                href={`/weddings/${w.id}`}
                className="dash-row"
                style={{ padding: "1.25rem 0.25rem", gap: "var(--space-8)", opacity: isPast ? 0.6 : 1 }}
              >
                <div style={{ textAlign: "center", minWidth: "58px", flexShrink: 0 }}>
                  <div style={{ fontSize: "var(--text-5xl)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", lineHeight: 1.05 }}>{day}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)", textTransform: "uppercase" }}>{month} {year}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</h3>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>{w.venue ?? tw.venueUnknown} · {formatDate(new Date(w.date))}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <span>{w._count.guests} {tw.guests}</span>
                    <span>{w._count.tasks} {tw.tasks}</span>
                    <span>{w._count.vendors} {tw.vendors}</span>
                    <span className="font-mono">{w.weddingCode}</span>
                  </div>
                </div>

                {w.teamMembers.length > 0 && (
                  <div className="flex -space-x-2 flex-shrink-0">
                    {w.teamMembers.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--gold)", color: "var(--ink)", border: "2px solid var(--background)" }}
                        title={m.user.name}
                      >
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-right flex-shrink-0" style={{ minWidth: "72px" }}>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: urgent ? 700 : 600, color: urgent ? "var(--gold-deep)" : "var(--foreground)" }}>
                    {isPast ? Math.abs(days) : days}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {isPast ? tw.passed : tw.days}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
