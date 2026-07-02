import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = { open: "Open", in_progress: "Bezig", done: "Afgerond" };
const PRIORITY_META: Record<string, { label: string; color: string; weight: number }> = {
  high:   { label: "Urgent", color: "var(--gold-deep)",   weight: 700 },
  medium: { label: "Middel", color: "var(--muted)",       weight: 500 },
  low:    { label: "Laag",   color: "var(--muted-light)", weight: 400 },
};

function formatDate(d?: Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(d));
}

export default async function MyTasksPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { assignedTo: user.id },
    include: { wedding: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Mijn taken</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{open.length} open · {done.length} afgerond</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Geen taken. Geniet ervan!
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {[...open, ...done].map((task) => {
            const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
            const isDone = task.status === "done";
            return (
              <div key={task.id} className="dash-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    className={isDone ? "line-through" : ""}
                    style={{ fontSize: "0.9375rem", fontWeight: isDone ? 400 : meta.weight, color: isDone ? "var(--muted-light)" : "var(--foreground)" }}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
                    <Link href={`/weddings/${task.weddingId}`} className="font-serif" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                      {task.wedding.title}
                    </Link>
                    {!isDone && (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: meta.color }}>
                        {meta.label}
                      </span>
                    )}
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-light)" }}>
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                    {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
