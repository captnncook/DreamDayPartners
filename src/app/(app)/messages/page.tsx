import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatTime(iso: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default async function AllMessagesPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  let threads;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { OR: [{ type: "vendor", vendorId: vendor?.id }] },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  } else if (user.role === "couple") {
    const coupleWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { weddingId: { in: coupleWeddings.map((m) => m.weddingId) }, type: "couple" },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { weddingId: { in: myWeddings.map((m) => m.weddingId) } },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  }

  const THREAD_ICONS: Record<string, string> = { internal: "🔒", couple: "💍", vendor: "🤝" };
  const THREAD_LABELS: Record<string, string> = { internal: "Intern team", couple: "Bruidspaar", vendor: "Leverancier" };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Alle berichten</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{threads.length} gesprekken</p>
      {threads.length === 0 ? (
        <div className="ddp-card text-center py-12" style={{ color: "var(--muted)" }}><div className="text-3xl mb-2">💬</div><p>Nog geen berichten</p></div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => {
            const lastMsg = thread.messages[0];
            return (
              <Link key={thread.id} href={`/weddings/${thread.weddingId}/messages`}
                className="ddp-card flex items-center gap-4 hover:shadow-md transition-shadow">
                <span className="text-2xl flex-shrink-0">{THREAD_ICONS[thread.type] ?? "💬"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{thread.subject ?? THREAD_LABELS[thread.type]}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>• {thread.wedding?.title}</span>
                  </div>
                  {lastMsg && <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}><strong>{lastMsg.sender.name}:</strong> {lastMsg.content}</p>}
                </div>
                {lastMsg && <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{formatTime(lastMsg.createdAt)}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
