import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const requests = await prisma.vendorFeatureRequest.findMany({
    include: { vendor: { select: { id: true, name: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });

  requests.sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1));

  return NextResponse.json({ requests });
}
