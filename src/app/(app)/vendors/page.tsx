import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AllVendorsClient from "./AllVendorsClient";

export default async function AllVendorsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
  const weddingIds = myWeddings.map((m) => m.weddingId);

  const weddings = await prisma.wedding.findMany({
    where: { id: { in: weddingIds } },
    include: { vendors: { include: { vendor: true } } },
    orderBy: { date: "asc" },
  });

  const weddingsForClient = weddings.map((w) => ({
    id: w.id,
    title: w.title,
    vendors: w.vendors.map((wv) => ({
      id: wv.id,
      vendor: {
        id: wv.vendor.id,
        name: wv.vendor.name,
        category: wv.vendor.category,
        phone: wv.vendor.phone,
      },
    })),
  }));

  return <AllVendorsClient weddings={weddingsForClient} />;
}
