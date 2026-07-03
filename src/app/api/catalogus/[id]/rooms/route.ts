import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function canEdit(vendorId: string) {
  const user = await getSession();
  if (!user) return null;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) return null;
  if (vendor.userId !== user.id && user.role !== "admin") return null;
  return vendor;
}

// POST — nieuwe zaal toevoegen aan een trouwlocatie
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await canEdit(id);
  if (!vendor) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await req.json();
  const name = (body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const count = await prisma.venueRoom.count({ where: { vendorId: id } });

  const room = await prisma.venueRoom.create({
    data: {
      vendorId: id,
      name,
      surfaceArea: body.surfaceArea ? Number(body.surfaceArea) : null,
      ceilingHeight: body.ceilingHeight ? Number(body.ceilingHeight) : null,
      ceremonyMin: body.ceremonyMin ? Number(body.ceremonyMin) : null,
      ceremonyMax: body.ceremonyMax ? Number(body.ceremonyMax) : null,
      receptionMin: body.receptionMin ? Number(body.receptionMin) : null,
      receptionMax: body.receptionMax ? Number(body.receptionMax) : null,
      dinnerMin: body.dinnerMin ? Number(body.dinnerMin) : null,
      dinnerMax: body.dinnerMax ? Number(body.dinnerMax) : null,
      partyMin: body.partyMin ? Number(body.partyMin) : null,
      partyMax: body.partyMax ? Number(body.partyMax) : null,
      order: count,
    },
  });

  return NextResponse.json({ room }, { status: 201 });
}
