import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const requests = await prisma.vendorClaimRequest.findMany({
    where: {
      OR: [
        { status: { not: "completed" } },
        { status: "completed", completedAt: { gte: sevenDaysAgo } },
      ],
    },
    include: { vendor: { select: { id: true, name: true, category: true, city: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}
