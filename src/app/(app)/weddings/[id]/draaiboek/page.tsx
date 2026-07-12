import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DraaiboekClient from "./DraaiboekClient";

export default async function DraaiboekPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const accessWhere =
    user.role === "admin"
      ? { id }
      : user.role === "vendor"
      ? { id, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({
    where: accessWhere,
    select: { id: true, title: true, date: true, endDate: true, isPremium: true },
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
  let ownVendorId: string | null = null;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    ownVendorId = vendor?.id ?? null;
    filteredDraaiboeken = draaiboeken.map((d) => ({
      ...d,
      items: d.items.filter((item) =>
        !vendor || item.vendorId === vendor.id || (item as { isPublic?: boolean }).isPublic
      ),
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
      weddingEndDate={wedding.endDate ? wedding.endDate.toISOString() : null}
      draaiboeken={JSON.parse(JSON.stringify(filteredDraaiboeken))}
      teamMembers={JSON.parse(JSON.stringify(teamMembers))}
      vendors={JSON.parse(JSON.stringify(vendors))}
      currentUser={JSON.parse(JSON.stringify(user))}
      isPremium={wedding.isPremium}
      ownVendorId={ownVendorId}
    />
  );
}
