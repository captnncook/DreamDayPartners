import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!wedding) notFound();

  let threadFilter: object = { weddingId: id };
  let linkedVendors: { id: string; name: string }[] = [];

  if (user.role === "couple") {
    // Het bruidspaar is eigenaar van de bruiloft en moet elk gesprek over
    // deze bruiloft kunnen zien, ook een net zelf aangemaakt "vendor"-thread
    // — voorheen filterde dit alleen op type "couple", waardoor een eigen
    // "Leverancier"-gesprek na een herlaad leek te zijn verdwenen.
    threadFilter = { weddingId: id };
    const weddingVendors = await prisma.weddingVendor.findMany({
      where: { weddingId: id },
      include: { vendor: { select: { id: true, name: true } } },
    });
    linkedVendors = weddingVendors.map((wv) => wv.vendor);
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
      linkedVendors={linkedVendors}
    />
  );
}
