import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getDownloadUrl } from "@/lib/r2";
import { getVendorTypeConfig } from "@/lib/vendorTypeConfigs";
import { getOwnVendorId } from "@/lib/vendorAuth";

// GET /api/dm/search-recipients?q=... — search vendors and planners by name
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ recipients: [] });

  // Wie mag een leverancier vinden en berichten? Iedereen kon voorheen
  // vendors/planners/admins vinden, maar een leverancier kon nooit het
  // bruidspaar terugvinden (rol "couple" ontbrak volledig) — scoped tot
  // bruidsparen/teamleden van bruiloften waar deze leverancier ook echt
  // aan gekoppeld is, om te voorkomen dat een leverancier zomaar elk
  // willekeurig bruidspaar op het platform kan opzoeken.
  let allowedIds: string[] | null = null;
  if (user.role === "vendor") {
    const vendorId = await getOwnVendorId(user.id);
    if (vendorId) {
      const bookings = await prisma.weddingVendor.findMany({
        where: { vendorId },
        select: { weddingId: true },
      });
      const weddingIds = bookings.map((b) => b.weddingId);
      const teamMembers = await prisma.weddingTeamMember.findMany({
        where: { weddingId: { in: weddingIds } },
        select: { userId: true },
      });
      allowedIds = teamMembers.map((tm) => tm.userId);
    } else {
      allowedIds = [];
    }
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      ...(allowedIds
        ? { OR: [{ role: { in: ["planner", "admin"] } }, { id: { in: allowedIds } }] }
        : { role: { in: ["vendor", "planner", "admin"] } }),
      AND: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
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
    select: { userId: true, name: true, category: true, emblemPhoto: true, coverPhoto: true },
    take: 10,
  });

  // Merge: vendor profile info takes precedence for display name/category
  const vendorByUserId = new Map(vendors.filter(v => v.userId).map(v => [v.userId!, v]));

  async function photoUrlFor(v: { emblemPhoto: string | null; coverPhoto: string | null } | undefined) {
    const key = v?.emblemPhoto ?? v?.coverPhoto ?? null;
    return key ? await getDownloadUrl(key, 3600).catch(() => null) : null;
  }

  const seen = new Set<string>();
  const recipients: { userId: string; name: string; role: string; category?: string; photoUrl?: string | null }[] = [];

  for (const u of users) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    const vProfile = vendorByUserId.get(u.id);
    recipients.push({
      userId: u.id,
      name: vProfile?.name ?? u.name,
      role: u.role,
      category: vProfile ? getVendorTypeConfig(vProfile.category).label : undefined,
      photoUrl: await photoUrlFor(vProfile),
    });
  }

  // Add vendor profiles not yet covered (vendor name matched but user name didn't)
  for (const v of vendors) {
    if (!v.userId || seen.has(v.userId)) continue;
    seen.add(v.userId);
    recipients.push({
      userId: v.userId, name: v.name, role: "vendor",
      category: getVendorTypeConfig(v.category).label,
      photoUrl: await photoUrlFor(v),
    });
  }

  return NextResponse.json({ recipients });
}
