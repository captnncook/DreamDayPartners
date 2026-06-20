import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({ where: { id }, select: { id: true, title: true, isPremium: true } });
  if (!wedding) notFound();

  let threadFilter: object = { weddingId: id };

  if (user.role === "couple") {
    threadFilter = { weddingId: id, type: { in: ["couple"] } };
  } else if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    threadFilter = { weddingId: id, OR: [{ type: "vendor", vendorId: vendor?.id }] };
  }

  const threads = await prisma.messageThread.findMany({
    where: threadFilter,
    include: {
      messages: {
        include: { sender: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MessagesClient
      weddingId={id}
      weddingTitle={wedding.title}
      threads={JSON.parse(JSON.stringify(threads))}
      currentUser={JSON.parse(JSON.stringify(user))}
      isPremium={wedding.isPremium}
    />
  );
}
