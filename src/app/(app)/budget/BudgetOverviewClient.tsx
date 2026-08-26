"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

function euro(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

type WeddingWithBudget = { id: string; title: string; spent: number; total: number };

export default function BudgetOverviewClient({ weddings }: { weddings: WeddingWithBudget[] }) {
  const { t } = useLang();
  const tb = t.budget;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tb.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{tb.overviewSubtitle.replace("{n}", String(weddings.length)).replace("{s}", weddings.length !== 1 ? "en" : "")}</p>
      </div>

      {weddings.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {tb.overviewNone}
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {weddings.map((w) => {
            const pct = w.total > 0 ? Math.min(100, Math.round((w.spent / w.total) * 100)) : 0;
            const over = pct > 90;
            return (
              <Link key={w.id} href={`/weddings/${w.id}/budget`} className="dash-row" style={{ padding: "1.125rem 0.25rem", display: "block" }}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--foreground)" }}>{w.title}</span>
                  <span className="text-sm">
                    <span style={{ fontWeight: 700, color: over ? "var(--gold-deep)" : "var(--foreground)" }}>{euro(w.spent)}</span>
                    <span style={{ color: "var(--muted)" }}> {tb.of} {euro(w.total)}</span>
                  </span>
                </div>
                <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden", margin: "0.625rem 0 0.375rem" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--gold-deep)" : "var(--ink)" }} />
                </div>
                <div className="text-xs flex justify-between" style={{ color: "var(--muted)" }}>
                  <span style={{ fontWeight: over ? 700 : 400, color: over ? "var(--gold-deep)" : "var(--muted)" }}>{pct}% {tb.used}</span>
                  <span>{tb.remainingLabel.replace("{n}", euro(w.total - w.spent))}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
