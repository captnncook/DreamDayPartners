import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AllMessagesClient from "./AllMessagesClient";

export default async function AllMessagesPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  let threads;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { OR: [{ type: "vendor", vendorId: vendor?.id }] },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  } else if (user.role === "couple") {
    const coupleWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { weddingId: { in: coupleWeddings.map((m) => m.weddingId) }, type: "couple" },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const myWeddings = await prisma.weddingTeamMember.findMany({ where: { userId: user.id } });
    threads = await prisma.messageThread.findMany({
      where: { weddingId: { in: myWeddings.map((m) => m.weddingId) } },
      include: { wedding: true, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  }

  return <AllMessagesClient threads={JSON.parse(JSON.stringify(threads))} />;
}
