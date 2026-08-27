import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";

  const [errors, counts] = await Promise.all([
    prisma.errorLog.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.errorLog.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countByStatus: Record<string, number> = { new: 0, seen: 0, resolved: 0 };
  for (const c of counts) countByStatus[c.status] = c._count.status;

  return NextResponse.json({ errors, countByStatus });
}
