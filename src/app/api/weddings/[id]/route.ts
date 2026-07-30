import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { geocodeCity } from "@/lib/geocode";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      owner: true,
      teamMembers: { include: { user: true } },
      vendors: { include: { vendor: true } },
      budget: { include: { items: { include: { vendor: true } } } },
      tasks: { include: { assignedUser: true } },
      guests: true,
      draaiboeken: { include: { items: { include: { vendor: true }, orderBy: { sortOrder: "asc" } } } },
      threads: { include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" }, take: 5 } } },
      seatTables: { include: { guests: true } },
    },
  });

  if (!wedding) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json({ wedding });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Als de plaats van het bruidspaar wijzigt, opnieuw geocoderen zodat we
  // leveranciers bij hen in de buurt kunnen tonen in de catalogus.
  let locationUpdate: { locationCity?: string | null; province?: string | null; latitude?: number | null; longitude?: number | null } = {};
  if (body.locationCity !== undefined || body.province !== undefined) {
    const current = await prisma.wedding.findUnique({ where: { id }, select: { locationCity: true } });
    const nextCity: string | null = body.locationCity !== undefined ? (body.locationCity || null) : (current?.locationCity ?? null);
    locationUpdate = {
      ...(body.locationCity !== undefined && { locationCity: nextCity }),
      ...(body.province !== undefined && { province: body.province || null }),
    };
    if (body.locationCity !== undefined && nextCity && nextCity !== current?.locationCity) {
      const geo = await geocodeCity(nextCity);
      locationUpdate.latitude = geo.latitude ?? null;
      locationUpdate.longitude = geo.longitude ?? null;
    } else if (body.locationCity !== undefined && !nextCity) {
      locationUpdate.latitude = null;
      locationUpdate.longitude = null;
    }
  }

  const wedding = await prisma.wedding.update({
    where: { id },
    data: {
      title: body.title,
      date: body.date ? new Date(body.date) : undefined,
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      venue: body.venue,
      status: body.status,
      notes: body.notes,
      ...locationUpdate,
    },
  });

  return NextResponse.json({ wedding });
}
