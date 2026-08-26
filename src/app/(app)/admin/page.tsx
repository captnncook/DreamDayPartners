import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminOverviewClient from "./AdminOverviewClient";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const [userCount, weddingCount, vendorCount] = await Promise.all([
    prisma.user.count(), prisma.wedding.count(), prisma.vendor.count(),
  ]);

  const weddings = await prisma.wedding.findMany({
    include: { owner: true, _count: { select: { guests: true, vendors: true } } },
    orderBy: { date: "asc" },
  });

  const weddingsForClient = weddings.map((w) => ({
    id: w.id,
    title: w.title,
    weddingCode: w.weddingCode,
    ownerName: w.owner.name,
    guestCount: w._count.guests,
    vendorCount: w._count.vendors,
  }));

  return (
    <AdminOverviewClient
      userCount={userCount}
      weddingCount={weddingCount}
      vendorCount={vendorCount}
      weddings={weddingsForClient}
    />
  );
}
