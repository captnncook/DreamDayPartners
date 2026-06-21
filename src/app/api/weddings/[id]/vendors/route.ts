import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const vendors = await prisma.weddingVendor.findMany({
    where: { weddingId: id },
    include: { vendor: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ vendors });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { vendorId, notes } = await req.json();

  const existing = await prisma.weddingVendor.findFirst({ where: { weddingId: id, vendorId } });
  if (existing) return NextResponse.json({ error: "Al gekoppeld" }, { status: 409 });

  const wv = await prisma.weddingVendor.create({
    data: { weddingId: id, vendorId, notes: notes ?? null, status: "contacted" },
    include: { vendor: true },
  });

  return NextResponse.json({ vendor: wv }, { status: 201 });
}
