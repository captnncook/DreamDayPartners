import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/catalogus/[id]/dream-team  body: { weddingId }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: vendorId } = await params;
  const { weddingId } = await req.json();

  if (!weddingId) return NextResponse.json({ error: "weddingId ontbreekt" }, { status: 400 });

  // Verify user has access to this wedding
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: weddingId,
      OR: [{ ownerId: user.id }, { teamMembers: { some: { userId: user.id } } }],
    },
  });
  if (!wedding) return NextResponse.json({ error: "Geen toegang tot deze bruiloft" }, { status: 403 });

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) return NextResponse.json({ error: "Leverancier niet gevonden" }, { status: 404 });

  // Upsert to avoid duplicates
  const existing = await prisma.weddingVendor.findUnique({
    where: { weddingId_vendorId: { weddingId, vendorId } },
  });

  if (existing) {
    return NextResponse.json({ message: "Al toegevoegd", weddingVendor: existing });
  }

  const weddingVendor = await prisma.weddingVendor.create({
    data: { weddingId, vendorId, status: "contacted" },
  });

  return NextResponse.json({ weddingVendor });
}
