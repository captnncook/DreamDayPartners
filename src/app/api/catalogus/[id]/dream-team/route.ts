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

  // Maak een uitnodiging die de leverancier kan accepteren of afwijzen.
  // portalAccess blijft false totdat de leverancier accepteert.
  const weddingVendor = await prisma.weddingVendor.create({
    data: { weddingId, vendorId, status: "invited" },
  });

  // Stuur de gekoppelde leverancier-account een melding.
  if (vendor.userId) {
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        weddingId,
        type: "vendor_invite",
        content: `Je bent uitgenodigd voor het Dream Team van "${wedding.title}".`,
        relatedType: "weddingVendor",
        relatedId: weddingVendor.id,
      },
    });
  }

  return NextResponse.json({ weddingVendor });
}
