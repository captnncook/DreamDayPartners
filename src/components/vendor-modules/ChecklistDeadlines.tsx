"use client";

interface ChecklistItem {
  id: string;
  title: string;
  status: string;
  dueDate?: string | null;
  priority: string;
}

interface Props {
  tasks: ChecklistItem[];
  weddingId: string;
}

function fmt(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

const STATUS_COLORS: Record<string, string> = {
  open: "var(--muted)",
  in_progress: "var(--primary)",
  done: "#22c55e",
};

export default function ChecklistDeadlines({ tasks, weddingId }: Props) {
  const open = tasks.filter(t => t.status !== "done");
  const done = tasks.filter(t => t.status === "done");

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Checklist & Deadlines</h3>
        <a href={`/weddings/${weddingId}/taken`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>Alle taken →</a>
      </div>

      {tasks.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Geen taken gekoppeld.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {open.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.75rem", background: "var(--blush-soft)", borderRadius: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_COLORS[t.status] ?? "var(--muted)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: "var(--charcoal)" }}>{t.title}</span>
              </div>
              {t.dueDate && <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{fmt(t.dueDate)}</span>}
            </div>
          ))}
          {done.length > 0 && (
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", paddingTop: "0.25rem" }}>
              {done.length} {done.length === 1 ? "taak" : "taken"} afgerond
            </div>
          )}
        </div>
      )}
    </div>
  );
}
