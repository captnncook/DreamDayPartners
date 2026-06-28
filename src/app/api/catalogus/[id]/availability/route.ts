import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { busyDates: true } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ busyDates: vendor.busyDates });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { userId: true } });
  if (!vendor || vendor.userId !== user.id) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { busyDates } = await req.json();
  const updated = await prisma.vendor.update({ where: { id }, data: { busyDates } });
  return NextResponse.json({ busyDates: updated.busyDates });
}
