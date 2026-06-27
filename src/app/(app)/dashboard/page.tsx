import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, CheckSquare, Calendar, Sparkles } from "lucide-react";
import DashboardClient from "./DashboardClient";

function daysUntil(date: Date) {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  let weddings: Awaited<ReturnType<typeof prisma.wedding.findMany>>;

  if (user.role === "admin") {
    weddings = await prisma.wedding.findMany({
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 10,
    });
  } else if (user.role === "vendor") {
    weddings = await prisma.wedding.findMany({
      where: { vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 50,
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: { teamMembers: { some: { userId: user.id } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  }

  // Couple users: show all wedding tasks (not just ones assigned to them)
  // Other roles: show tasks assigned to them
  const coupleWeddingIds = user.role === "couple" ? weddings.map(w => w.id) : [];
  const myTasks = user.role !== "vendor" ? await prisma.task.findMany({
    where: user.role === "couple"
      ? { weddingId: { in: coupleWeddingIds }, status: { not: "done" } }
      : { assignedTo: user.id, status: { not: "done" } },
    include: { wedding: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  }) : [];

  // For couple: also get total task counts for progress display
  const taskCounts = user.role === "couple" && coupleWeddingIds.length > 0 ? await prisma.task.groupBy({
    by: ["status"],
    where: { weddingId: { in: coupleWeddingIds } },
    _count: true,
  }) : [];

  // Openstaande Dream Team-uitnodigingen voor leveranciers.
  const vendorRequests = user.role === "vendor" ? await prisma.weddingVendor.findMany({
    where: { status: "invited", vendor: { userId: user.id } },
    include: { wedding: true },
    orderBy: { createdAt: "desc" },
  }) : [];

  const requestsData = vendorRequests.map((wv) => ({
    id: wv.id,
    weddingTitle: wv.wedding.title,
    weddingVenue: wv.wedding.venue,
    weddingDate: wv.wedding.date.toISOString(),
  }));

  const greetings: Record<string, string> = {
    admin: "Platform overzicht",
    planner: `Goedemorgen, ${user.name.split(" ")[0]}`,
    team_member: `Goedemorgen, ${user.name.split(" ")[0]}`,
    couple: `Welkom bij jullie dream day`,
    vendor: `Welkom in het dream team`,
  };

  const statsCards = user.role !== "couple" && user.role !== "vendor" ? [
    { label: "Bruiloften", value: weddings.length, icon: "Heart" },
    { label: "Open taken", value: myTasks.length, icon: "CheckSquare" },
    { label: "Komende 30 dagen", value: weddings.filter((w) => daysUntil(w.date) <= 30 && daysUntil(w.date) > 0).length, icon: "Calendar" },
    { label: "Dit jaar", value: weddings.filter((w) => new Date(w.date).getFullYear() === new Date().getFullYear()).length, icon: "Sparkles" },
  ] : [];

  const weddingsData = weddings.map((w) => ({
    id: w.id,
    title: w.title,
    venue: w.venue,
    date: w.date.toISOString(),
    status: w.status,
    isPremium: w.isPremium,
    days: daysUntil(w.date),
  }));

  const tasksData = myTasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString(),
    weddingId: t.weddingId,
    weddingTitle: t.wedding.title,
  }));

  const totalTasks = taskCounts.reduce((s, g) => s + g._count, 0);
  const doneTasks = taskCounts.find(g => g.status === "done")?._count ?? 0;

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, role: user.role }}
      greeting={greetings[user.role] ?? "Welkom"}
      statsCards={statsCards}
      weddings={weddingsData}
      tasks={tasksData}
      taskProgress={user.role === "couple" ? { total: totalTasks, done: doneTasks } : undefined}
      vendorRequests={requestsData}
    />
  );
}
