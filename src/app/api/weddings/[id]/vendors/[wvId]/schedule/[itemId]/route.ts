import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { authorizeWeddingVendor, getOwnVendorId } from "@/lib/vendorAuth";

type Params = { params: Promise<{ id: string; wvId: string; itemId: string }> };

async function resolveItem(itemId: string) {
  return prisma.draaiboekItem.findUnique({ where: { id: itemId }, select: { id: true, vendorId: true } });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId, itemId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  if (user.role === "vendor") {
    const [item, ownVendorId] = await Promise.all([resolveItem(itemId), getOwnVendorId(user.id)]);
    if (!item || item.vendorId !== ownVendorId) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  const body = await req.json();
  const item = await prisma.draaiboekItem.update({
    where: { id: itemId },
    data: {
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId, itemId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  if (user.role === "vendor") {
    const [item, ownVendorId] = await Promise.all([resolveItem(itemId), getOwnVendorId(user.id)]);
    if (!item || item.vendorId !== ownVendorId) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  await prisma.draaiboekItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
