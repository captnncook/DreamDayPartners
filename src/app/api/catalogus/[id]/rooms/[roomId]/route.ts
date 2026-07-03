import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function canEdit(vendorId: string) {
  const user = await getSession();
  if (!user) return null;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) return null;
  if (vendor.userId !== user.id && user.role !== "admin") return null;
  return vendor;
}

const NUMERIC_FIELDS = [
  "surfaceArea", "ceilingHeight",
  "ceremonyMin", "ceremonyMax", "receptionMin", "receptionMax",
  "dinnerMin", "dinnerMax", "partyMin", "partyMax",
] as const;

// PATCH — zaal bewerken
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = await params;
  const vendor = await canEdit(id);
  if (!vendor) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const room = await prisma.venueRoom.findUnique({ where: { id: roomId } });
  if (!room || room.vendorId !== id) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  for (const field of NUMERIC_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] === "" || body[field] === null ? null : Number(body[field]);
  }

  const updated = await prisma.venueRoom.update({ where: { id: roomId }, data });
  return NextResponse.json({ room: updated });
}

// DELETE — zaal verwijderen
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = await params;
  const vendor = await canEdit(id);
  if (!vendor) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const room = await prisma.venueRoom.findUnique({ where: { id: roomId } });
  if (!room || room.vendorId !== id) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  await prisma.venueRoom.delete({ where: { id: roomId } });
  return NextResponse.json({ ok: true });
}
