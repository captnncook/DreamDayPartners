import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; draaiboekId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, draaiboekId } = await params;

  // Items toevoegen mag door admin, teamleden van deze bruiloft (planner,
  // team_member, bruidspaar) of een gekoppelde leverancier met portaltoegang.
  const accessWhere =
    user.role === "admin"
      ? { id: weddingId }
      : user.role === "vendor"
      ? { id: weddingId, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id: weddingId, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({ where: accessWhere, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const draaiboek = await prisma.draaiboek.findFirst({ where: { id: draaiboekId, weddingId }, select: { id: true } });
  if (!draaiboek) return NextResponse.json({ error: "Draaiboek niet gevonden" }, { status: 404 });

  const body = await req.json();
  const vendorIds: string[] = Array.isArray(body.vendorIds) ? body.vendorIds.filter(Boolean) : [];

  const item = await prisma.draaiboekItem.create({
    data: {
      draaiboekId,
      startTime: body.startTime,
      duration: body.duration ?? 30,
      title: body.title,
      description: body.description ?? null,
      location: body.location ?? null,
      sortOrder: body.sortOrder ?? 0,
      assignedUserId: body.assignedUserId ?? null,
      vendorId: vendorIds[0] ?? null,
      visibleVendorIds: vendorIds,
      notes: body.notes ?? null,
      isPublic: body.isPublic ?? true,
    },
    include: { vendor: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
