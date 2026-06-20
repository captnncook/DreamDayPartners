import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DraaiboekClient from "./DraaiboekClient";

export default async function DraaiboekPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    select: { id: true, title: true, date: true, isPremium: true },
  });
  if (!wedding) notFound();

  const draaiboeken = await prisma.draaiboek.findMany({
    where: { weddingId: id },
    include: {
      items: {
        include: { vendor: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let filteredDraaiboeken = draaiboeken;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    filteredDraaiboeken = draaiboeken.map((d) => ({
      ...d,
      items: d.items.filter((item) => !vendor || item.vendorId === vendor.id),
    }));
  }

  const teamMembers = await prisma.weddingTeamMember.findMany({
    where: { weddingId: id },
    include: { user: true },
  });

  const vendors = await prisma.weddingVendor.findMany({
    where: { weddingId: id },
    include: { vendor: true },
  });

  return (
    <DraaiboekClient
      weddingId={id}
      weddingTitle={wedding.title}
      weddingDate={wedding.date.toISOString()}
      draaiboeken={JSON.parse(JSON.stringify(filteredDraaiboeken))}
      teamMembers={JSON.parse(JSON.stringify(teamMembers))}
      vendors={JSON.parse(JSON.stringify(vendors))}
      currentUser={JSON.parse(JSON.stringify(user))}
      isPremium={wedding.isPremium}
    />
  );
}
