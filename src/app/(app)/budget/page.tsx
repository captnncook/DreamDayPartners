import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BudgetOverviewClient from "./BudgetOverviewClient";

export default async function AllBudgetPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
  const weddingIds = myWeddings.map((m) => m.weddingId);

  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    include: { budget: { include: { items: true } } },
    orderBy: { date: "asc" },
  });

  const withBudget = weddings.filter((w) => w.budget);

  const weddingsForClient = withBudget.map((w) => ({
    id: w.id,
    title: w.title,
    spent: w.budget!.items.reduce((s, i) => s + i.actual, 0),
    total: w.budget!.totalAmount,
  }));

  return <BudgetOverviewClient weddings={weddingsForClient} />;
}
