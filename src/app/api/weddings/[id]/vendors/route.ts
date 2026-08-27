import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";
import { getDownloadUrl } from "@/lib/r2";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  // Vendors mogen alleen het team zien van een bruiloft waar ze zelf ook
  // aan gekoppeld zijn (discovery + contact met collega-leveranciers) —
  // geen toegang tot bruiloften waar ze niets mee te maken hebben.
  if (user.role === "vendor") {
    const ownVendorId = await getOwnVendorId(user.id);
    if (!ownVendorId) return NextResponse.json({ vendors: [] });
    const ownBooking = await prisma.weddingVendor.findFirst({ where: { weddingId: id, vendorId: ownVendorId } });
    if (!ownBooking) return NextResponse.json({ vendors: [] });
  }

  const vendors = await prisma.weddingVendor.findMany({
    where: { weddingId: id },
    include: { vendor: true },
    orderBy: { createdAt: "asc" },
  });

  // Schildfoto (zelfde bron als Dream Team) meesturen als gesigned URL.
  const vendorsWithPhoto = await Promise.all(
    vendors.map(async (wv) => {
      const photoKey = wv.vendor.emblemPhoto ?? wv.vendor.coverPhoto ?? null;
      const photoUrl = photoKey ? await getDownloadUrl(photoKey, 3600).catch(() => null) : null;
      return { ...wv, vendor: { ...wv.vendor, photoUrl } };
    })
  );

  return NextResponse.json({ vendors: vendorsWithPhoto });
}

async function POSTHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  // Iedereen van het team van deze bruiloft mag een leverancier koppelen —
  // dit sloot voorheen het bruidspaar zelf (rol "couple") uit, terwijl dat
  // juist de meest voorkomende gebruiker van deze knop is.
  const accessWhere =
    user.role === "admin" ? { id } : { id, teamMembers: { some: { userId: user.id } } };
  const wedding = await prisma.wedding.findFirst({ where: accessWhere, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { vendorId, notes, specificDate } = await req.json();

  const existing = await prisma.weddingVendor.findFirst({ where: { weddingId: id, vendorId } });
  if (existing) return NextResponse.json({ error: "Al gekoppeld" }, { status: 409 });

  // Maak een uitnodiging die de leverancier kan accepteren of afwijzen.
  const wv = await prisma.weddingVendor.create({
    data: { weddingId: id, vendorId, notes: notes ?? null, status: "invited", specificDate: specificDate ? new Date(specificDate) : null },
    include: { vendor: true },
  });

  // Stuur de gekoppelde leverancier-account een melding.
  if (wv.vendor.userId) {
    const wedding = await prisma.wedding.findUnique({ where: { id }, select: { title: true } });
    await prisma.notification.create({
      data: {
        userId: wv.vendor.userId,
        weddingId: id,
        type: "vendor_invite",
        content: `Je bent uitgenodigd voor het Dream Team van "${wedding?.title ?? "een bruiloft"}".`,
        relatedType: "weddingVendor",
        relatedId: wv.id,
      },
    });
  }

  return NextResponse.json({ vendor: wv }, { status: 201 });
}

export const GET = withErrorLogging(GETHandler);
export const POST = withErrorLogging(POSTHandler);
