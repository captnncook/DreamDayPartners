import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const accessWhere =
    user.role === "admin"
      ? { id }
      : user.role === "vendor"
      ? { id, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({ where: accessWhere, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const draaiboeken = await prisma.draaiboek.findMany({
    where: { weddingId: id },
    include: { items: { include: { vendor: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  let result = draaiboeken;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    result = draaiboeken.map((d) => ({
      ...d,
      items: d.items.filter((item) => !vendor || item.isPublic || item.vendorId === vendor.id || item.visibleVendorIds.includes(vendor.id)),
    }));
  }

  return NextResponse.json({ draaiboeken: result });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  // Aanmaken mag door admin of teamleden van deze bruiloft (planner,
  // team_member, bruidspaar) — niet door leveranciers.
  const memberWhere =
    user.role === "admin"
      ? { id }
      : { id, teamMembers: { some: { userId: user.id } } };
  const wedding = await prisma.wedding.findFirst({ where: memberWhere, select: { id: true } });
  if (!wedding || user.role === "vendor") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { title, version, date } = await req.json();

  const draaiboek = await prisma.draaiboek.create({
    data: { weddingId: id, title, version: version ?? "1.0", status: "draft", date: date ? new Date(date) : null },
  });

  return NextResponse.json({ draaiboek }, { status: 201 });
}
