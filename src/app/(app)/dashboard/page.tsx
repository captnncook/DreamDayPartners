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
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: { teamMembers: { some: { userId: user.id } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  }

  const myTasks = user.role !== "vendor" ? await prisma.task.findMany({
    where: { assignedTo: user.id, status: { not: "done" } },
    include: { wedding: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  }) : [];

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

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, role: user.role }}
      greeting={greetings[user.role] ?? "Welkom"}
      statsCards={statsCards}
      weddings={weddingsData}
      tasks={tasksData}
    />
  );
}
