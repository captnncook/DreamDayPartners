import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Circle, RefreshCw, CheckCircle2, CheckSquare, Heart, Calendar } from "lucide-react";

const STATUS_ICON_MAP: Record<string, React.ElementType> = { open: Circle, in_progress: RefreshCw, done: CheckCircle2 };
const STATUS_ICON_COLOR: Record<string, string> = { open: "var(--muted-light)", in_progress: "var(--warning)", done: "var(--success)" };
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
          <div className="flex justify-center mb-2"><CheckSquare className="w-8 h-8" style={{ color: "var(--accent-dark)" }} /></div>
          <p>Geen taken. Geniet ervan!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="ddp-card flex items-start gap-4">
              <span className="flex-shrink-0 mt-0.5">{(() => { const Icon = STATUS_ICON_MAP[task.status] ?? Circle; return <Icon className="w-5 h-5" style={{ color: STATUS_ICON_COLOR[task.status] ?? "var(--muted-light)" }} />; })()}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm ${task.status === "done" ? "line-through" : ""}`}
                    style={{ color: task.status === "done" ? "var(--muted)" : undefined }}>{task.title}</span>
                  <span className={`ddp-badge ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  <Link href={`/weddings/${task.weddingId}`} className="flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}><Heart className="w-3 h-3" /> {task.wedding.title}</Link>
                  {task.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(task.dueDate)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
