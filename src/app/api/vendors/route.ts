import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ vendors: [] });

  const vendors = await prisma.vendor.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { id: true, name: true, category: true, email: true, phone: true, contactPerson: true },
    orderBy: { name: "asc" },
    take: 20,
  });
  return NextResponse.json({ vendors });
}
