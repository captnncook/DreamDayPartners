import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";

type Params = { params: Promise<{ itemId: string }> };

const PLANNER_ROLES = ["admin", "planner", "team_member"];

async function canEditItem(userId: string, role: string, itemId: string): Promise<boolean> {
  if (PLANNER_ROLES.includes(role)) return true;
  if (role === "vendor") {
    const [item, ownVendorId] = await Promise.all([
      prisma.draaiboekItem.findUnique({ where: { id: itemId }, select: { vendorId: true } }),
      getOwnVendorId(userId),
    ]);
    return !!item && !!ownVendorId && item.vendorId === ownVendorId;
  }
  return false;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  if (!(await canEditItem(user.id, user.role, itemId))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }
  await prisma.draaiboekItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { itemId } = await params;
  if (!(await canEditItem(user.id, user.role, itemId))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }
  const body = await req.json();

  const item = await prisma.draaiboekItem.update({
    where: { id: itemId },
    data: {
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.vendorId !== undefined && { vendorId: body.vendorId || null }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
    },
    include: { vendor: { select: { id: true, name: true, category: true } } },
  });

  return NextResponse.json({ item });
}
