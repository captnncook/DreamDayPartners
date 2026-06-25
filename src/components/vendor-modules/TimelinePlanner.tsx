"use client";
import type { TimelineBlockTemplate } from "@/lib/vendorTypeConfigs";

interface TimelineBlock {
  id: string;
  startTime: string;
  duration: number;
  title: string;
  description?: string | null;
  location?: string | null;
  phase?: string | null;
}

interface Props {
  blocks: TimelineBlock[];
  templates: TimelineBlockTemplate[];
}

const PHASE_LABELS: Record<string, string> = {
  arrival: "Aankomst",
  setup: "Opbouw",
  perform: "Uitvoering",
  teardown: "Afbouw",
  custom: "Overig",
};

export default function TimelinePlanner({ blocks, templates }: Props) {
  if (blocks.length === 0 && templates.length === 0) return null;

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tijdlijn</h3>

      {blocks.length > 0 ? (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {blocks.map(b => (
            <div key={b.id} style={{ display: "flex", gap: "1rem", padding: "0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem" }}>
              <div style={{ flexShrink: 0, minWidth: "3.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--charcoal)" }}>{b.startTime}</span>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{b.duration}min</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--charcoal)" }}>{b.title}</div>
                {b.description && <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{b.description}</div>}
                {b.location && <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>📍 {b.location}</div>}
              </div>
              {b.phase && (
                <span style={{ fontSize: "0.75rem", padding: "0.125rem 0.5rem", borderRadius: "9999px", background: "var(--champagne-soft)", color: "var(--charcoal)", flexShrink: 0, alignSelf: "flex-start" }}>
                  {PHASE_LABELS[b.phase] ?? b.phase}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.75rem", fontStyle: "italic" }}>Nog geen tijdlijn items. Verwachte fases:</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {templates.map(t => (
              <div key={t.phase} style={{ padding: "0.5rem 0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600 }}>{PHASE_LABELS[t.phase] ?? t.phase}</span>
                <span style={{ color: "var(--muted)", marginLeft: "0.25rem" }}>~{t.defaultDuration}min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
