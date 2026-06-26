import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Find all duplicate groups and keep the earliest item per unique combo
  const allItems = await prisma.draaiboekItem.findMany({
    select: { id: true, draaiboekId: true, vendorId: true, title: true, startTime: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const seen = new Map<string, string>();
  const toDelete: string[] = [];

  for (const item of allItems) {
    const key = `${item.draaiboekId}__${item.vendorId ?? ""}__${item.title}__${item.startTime}`;
    if (seen.has(key)) {
      toDelete.push(item.id);
    } else {
      seen.set(key, item.id);
    }
  }

  if (toDelete.length > 0) {
    await prisma.draaiboekItem.deleteMany({ where: { id: { in: toDelete } } });
  }

  return NextResponse.json({ deleted: toDelete.length });
}
