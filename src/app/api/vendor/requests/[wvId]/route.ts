import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ wvId: string }> };

// POST /api/vendor/requests/[wvId]  body: { action: "accept" | "decline" }
// De ingelogde leverancier accepteert of wijst een Dream Team-uitnodiging af.
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { wvId } = await params;
  const { action } = await req.json();

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }

  // Controleer dat deze uitnodiging echt bij deze leverancier hoort.
  const booking = await prisma.weddingVendor.findFirst({
    where: { id: wvId, vendor: { userId: user.id } },
    include: { wedding: true },
  });
  if (!booking) return NextResponse.json({ error: "Uitnodiging niet gevonden" }, { status: 404 });

  if (booking.status !== "invited") {
    return NextResponse.json({ error: "Deze uitnodiging is al verwerkt" }, { status: 409 });
  }

  const accepted = action === "accept";

  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: {
      status: accepted ? "booked" : "declined",
      portalAccess: accepted,
    },
    include: { wedding: true, vendor: true },
  });

  // Markeer de bijbehorende uitnodigingsmelding als gelezen.
  await prisma.notification.updateMany({
    where: { userId: user.id, relatedType: "weddingVendor", relatedId: wvId, readAt: null },
    data: { readAt: new Date() },
  });

  // Informeer het bruidspaar (eigenaar van de bruiloft).
  await prisma.notification.create({
    data: {
      userId: booking.wedding.ownerId,
      weddingId: booking.weddingId,
      type: accepted ? "vendor_accepted" : "vendor_declined",
      content: accepted
        ? `${updated.vendor.name} heeft jullie uitnodiging voor het Dream Team geaccepteerd.`
        : `${updated.vendor.name} heeft jullie uitnodiging voor het Dream Team afgewezen.`,
      relatedType: "weddingVendor",
      relatedId: wvId,
    },
  });

  return NextResponse.json({ booking: updated });
}
