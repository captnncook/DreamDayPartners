import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { busyDates: true } });
  if (!vendor) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ busyDates: vendor.busyDates });
}

async function PATCHImpl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({ where: { id }, select: { userId: true } });
  if (!vendor || vendor.userId !== user.id) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { busyDates } = await req.json();
  const updated = await prisma.vendor.update({ where: { id }, data: { busyDates } });
  return NextResponse.json({ busyDates: updated.busyDates });
}

export const GET = withErrorLogging(GETImpl);
export const PATCH = withErrorLogging(PATCHImpl);
