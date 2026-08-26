"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const PRIORITY_META: Record<string, { color: string; weight: number }> = {
  high:   { color: "var(--gold-deep)",   weight: 700 },
  medium: { color: "var(--muted)",       weight: 500 },
  low:    { color: "var(--muted-light)", weight: 400 },
};

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(d));
}

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  weddingId: string;
  wedding: { title: string };
};

export default function MyTasksClient({ tasks }: { tasks: Task[] }) {
  const { t } = useLang();
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{t.tasks.myTasksTitle}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t.tasks.openDoneSummary.replace("{n}", String(open.length)).replace("{m}", String(done.length))}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {t.tasks.noTasksEnjoy}
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
                    style={{ fontSize: "var(--text-lg)", fontWeight: isDone ? 400 : meta.weight, color: isDone ? "var(--muted-light)" : "var(--foreground)" }}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
                    <Link href={`/weddings/${task.weddingId}`} className="font-serif" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                      {task.wedding.title}
                    </Link>
                    {!isDone && (
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: meta.color }}>
                        {t.tasks.priority[task.priority as keyof typeof t.tasks.priority] ?? task.priority}
                      </span>
                    )}
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-light)" }}>
                      {t.tasks.status[task.status as keyof typeof t.tasks.status] ?? task.status}
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
