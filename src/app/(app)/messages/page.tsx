import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatTime(iso: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

const THREAD_LABELS: Record<string, string> = { internal: "Intern team", couple: "Bruidspaar", vendor: "Leverancier" };

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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>Alle berichten</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{threads.length} gesprek{threads.length !== 1 ? "ken" : ""}</p>
      </div>

      {threads.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Nog geen berichten.
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {threads.map((thread) => {
            const lastMsg = thread.messages[0];
            return (
              <Link key={thread.id} href={`/weddings/${thread.weddingId}/messages`} className="dash-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                      {thread.subject ?? THREAD_LABELS[thread.type] ?? thread.type}
                    </span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-light)" }}>
                      {THREAD_LABELS[thread.type] ?? thread.type}
                    </span>
                    {thread.wedding && (
                      <span className="font-serif text-xs" style={{ fontWeight: 700, color: "var(--muted)" }}>{thread.wedding.title}</span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                      <span style={{ fontWeight: 600 }}>{lastMsg.sender.name}:</span> {lastMsg.content}
                    </p>
                  )}
                </div>
                {lastMsg && <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-light)" }}>{formatTime(lastMsg.createdAt)}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
