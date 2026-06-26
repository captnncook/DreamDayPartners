import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ invites: [] });

  const invites = await prisma.vendorWeddingInvite.findMany({
    where: { vendorId },
    include: { wedding: { select: { id: true, title: true, date: true } } },
    orderBy: { weddingDate: "asc" },
  });

  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 400 });

  const { email1, email2, weddingDate, weddingTitle, notes } = await req.json();
  if (!email1 || !weddingDate) {
    return NextResponse.json({ error: "E-mailadres en trouwdatum zijn verplicht" }, { status: 400 });
  }

  const date = new Date(weddingDate);
  date.setUTCHours(0, 0, 0, 0);

  // Check if there's already a wedding in the system that matches
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const matchingWedding = await prisma.wedding.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      OR: [
        { coupleEmail1: email1 }, { coupleEmail2: email1 },
        ...(email2 ? [{ coupleEmail1: email2 }, { coupleEmail2: email2 }] : []),
      ],
    },
  });

  const invite = await prisma.vendorWeddingInvite.create({
    data: {
      vendorId,
      email1: email1.toLowerCase(),
      email2: email2 ? email2.toLowerCase() : null,
      weddingDate: date,
      weddingTitle,
      notes,
      weddingId: matchingWedding?.id ?? null,
    },
    include: { wedding: { select: { id: true, title: true, date: true } } },
  });

  // Auto-link vendor to the wedding if a match was found
  if (matchingWedding) {
    await prisma.weddingVendor.upsert({
      where: { weddingId_vendorId: { weddingId: matchingWedding.id, vendorId } },
      update: { portalAccess: true },
      create: { weddingId: matchingWedding.id, vendorId, status: "lead", portalAccess: true },
    });
  }

  return NextResponse.json({ invite, matched: !!matchingWedding }, { status: 201 });
}
