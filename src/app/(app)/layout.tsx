import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  // For couple users: find their wedding so the sidebar can link to it directly
  let coupleWeddingId: string | null = null;
  if (user.role === "couple") {
    const membership = await prisma.weddingTeamMember.findFirst({
      where: { userId: user.id },
      select: { weddingId: true },
      orderBy: { createdAt: "asc" },
    });
    coupleWeddingId = membership?.weddingId ?? null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} coupleWeddingId={coupleWeddingId} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav user={user} />
        <main className="flex-1 min-w-0 overflow-auto" style={{ background: "var(--background)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
