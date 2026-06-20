import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_ICONS: Record<string, string> = { open: "⚪️", in_progress: "🔄", done: "✅" };
const PRIORITY_COLORS: Record<string, string> = { high: "badge-danger", medium: "badge-warning", low: "badge-neutral" };
const PRIORITY_LABELS: Record<string, string> = { high: "Hoog", medium: "Middel", low: "Laag" };

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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Mijn taken</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{tasks.length} taken toegewezen aan jou</p>
      {tasks.length === 0 ? (
        <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}>
          <div className="text-3xl mb-2">✅</div>
          <p>Geen taken. Geniet ervan!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="ddp-card flex items-start gap-4">
              <span className="text-xl flex-shrink-0 mt-0.5">{STATUS_ICONS[task.status] ?? "⚪️"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm ${task.status === "done" ? "line-through" : ""}`}
                    style={{ color: task.status === "done" ? "var(--muted)" : undefined }}>{task.title}</span>
                  <span className={`ddp-badge ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  <Link href={`/weddings/${task.weddingId}`} className="hover:underline" style={{ color: "var(--primary)" }}>💍 {task.wedding.title}</Link>
                  {task.dueDate && <span>📅 {formatDate(task.dueDate)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
