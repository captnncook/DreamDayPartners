import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/dm/search-recipients?q=... — search vendors and planners by name
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ recipients: [] });

  // Search users that are vendors or planners (not the current user)
  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      role: { in: ["vendor", "planner", "admin"] },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, role: true },
    take: 10,
  });

  // Also search vendor profiles by vendor name (linked to a user)
  const vendors = await prisma.vendor.findMany({
    where: {
      userId: { not: null },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { userId: true, name: true, category: true },
    take: 10,
  });

  // Merge: vendor profile info takes precedence for display name/category
  const vendorByUserId = new Map(vendors.filter(v => v.userId).map(v => [v.userId!, v]));

  const seen = new Set<string>();
  const recipients: { userId: string; name: string; role: string; category?: string }[] = [];

  for (const u of users) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    const vProfile = vendorByUserId.get(u.id);
    recipients.push({
      userId: u.id,
      name: vProfile?.name ?? u.name,
      role: u.role,
      category: vProfile?.category,
    });
  }

  // Add vendor profiles not yet covered (vendor name matched but user name didn't)
  for (const v of vendors) {
    if (!v.userId || seen.has(v.userId)) continue;
    seen.add(v.userId);
    recipients.push({ userId: v.userId, name: v.name, role: "vendor", category: v.category });
  }

  return NextResponse.json({ recipients });
}
