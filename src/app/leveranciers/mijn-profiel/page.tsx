import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MijnProfielPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) redirect("/leveranciers");

  redirect(`/leveranciers/${vendor.id}/bewerken`);
}
