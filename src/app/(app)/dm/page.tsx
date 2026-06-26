import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u`;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(date));
}

export default async function DmListPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const convs = await prisma.directConversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>Berichten</h1>

      {convs.length === 0 ? (
        <div className="ddp-card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--muted)" }}>
          <MessageCircle className="w-8 h-8" style={{ margin: "0 auto 0.75rem", color: "var(--border)" }} />
          <p style={{ fontSize: "0.9375rem" }}>Nog geen gesprekken</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {convs.map((conv) => {
            const other = conv.participants.find(p => p.userId !== user.id)?.user;
            const lastMsg = conv.messages[0];
            return (
              <Link
                key={conv.id}
                href={`/dm/${conv.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="ddp-card" style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem" }}>
                  <div style={{
                    width: "2.75rem", height: "2.75rem", borderRadius: "50%",
                    background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", fontWeight: 700, color: "var(--primary)", flexShrink: 0,
                  }}>
                    {other?.name?.charAt(0) ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{other?.name ?? "Onbekend"}</div>
                    {lastMsg && (
                      <div style={{ fontSize: "0.8125rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lastMsg.sender.id === user.id ? "Jij: " : ""}{lastMsg.content}
                      </div>
                    )}
                  </div>
                  {lastMsg && (
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}>
                      {timeAgo(lastMsg.createdAt)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
