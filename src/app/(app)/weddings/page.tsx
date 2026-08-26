import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WeddingsOverviewClient from "./WeddingsOverviewClient";

export default async function WeddingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "couple" || user.role === "vendor") redirect("/dashboard");

  const weddings = await prisma.wedding.findMany({
    where: user.role === "admin" ? {} : { teamMembers: { some: { userId: user.id } } },
    include: {
      owner: true,
      teamMembers: { include: { user: true } },
      _count: { select: { guests: true, tasks: true, vendors: true } },
    },
    orderBy: { date: "asc" },
  });

  return <WeddingsOverviewClient weddings={weddings} />;
}
