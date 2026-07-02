import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const PAGE_SIZE = 40;

// Admin-only: leveranciers doorzoeken om ze als "Aanbevolen" (premium) te
// markeren, ook als ze geen gekoppeld account hebben (bijv. bulk-import).
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      select: { id: true, name: true, category: true, city: true, isPremium: true, userId: true },
      orderBy: [{ isPremium: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vendor.count({ where }),
  ]);

  return NextResponse.json({ vendors, total, page, pageSize: PAGE_SIZE });
}
