import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { authorizeWeddingVendor } from "@/lib/vendorAuth";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const wv = await prisma.weddingVendor.findUnique({
    where: { id: wvId },
    select: { vendorId: true, weddingId: true },
  });
  if (!wv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.draaiboekItem.findMany({
    where: { vendorId: wv.vendorId, draaiboek: { weddingId: wv.weddingId } },
    include: { draaiboek: { select: { id: true, title: true, version: true } } },
    orderBy: { startTime: "asc" },
  });

  const draaiboeken = await prisma.draaiboek.findMany({
    where: { weddingId: wv.weddingId },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, version: true },
  });

  return NextResponse.json({ items, draaiboeken });
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const wv = await prisma.weddingVendor.findUnique({
    where: { id: wvId },
    select: { vendorId: true, weddingId: true },
  });
  if (!wv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { draaiboekId, startTime, duration, title, location, notes } = body;
  if (!draaiboekId || !startTime || !title) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const existing = await prisma.draaiboekItem.count({ where: { draaiboekId } });

  const item = await prisma.draaiboekItem.create({
    data: {
      draaiboekId,
      vendorId: wv.vendorId,
      startTime,
      duration: duration ?? 30,
      title,
      location: location || null,
      notes: notes || null,
      sortOrder: existing + 1,
    },
    include: { draaiboek: { select: { id: true, title: true, version: true } } },
  });

  return NextResponse.json({ item }, { status: 201 });
}
