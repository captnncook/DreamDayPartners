import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const [guests, wedding] = await Promise.all([
    prisma.guest.findMany({
      where: { weddingId: id },
      include: { seatingTable: true },
      orderBy: { name: "asc" },
    }),
    prisma.wedding.findUnique({ where: { id }, select: { rsvpToken: true } }),
  ]);

  return NextResponse.json({ guests, rsvpToken: wedding?.rsvpToken ?? null });
}

async function POSTHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Waarschuw (blokkeer niet) bij een naam die al op de gastenlijst staat —
  // twee mensen met dezelfde naam kan legitiem zijn, maar dit vangt de
  // veelvoorkomende fout van per ongeluk twee keer dezelfde gast invoeren.
  if (!body.confirmDuplicate) {
    const existing = await prisma.guest.findFirst({
      where: { weddingId: id, name: { equals: body.name?.trim(), mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "duplicate", message: `${body.name} staat al op de gastenlijst.`, existingGuestId: existing.id },
        { status: 409 }
      );
    }
  }

  const guest = await prisma.guest.create({
    data: {
      weddingId: id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      side: body.side ?? "both",
      rsvpStatus: body.rsvpStatus ?? "invited",
      dietary: body.dietary,
      allergies: body.allergies,
      plusOne: body.plusOne ?? false,
      isChild: body.isChild ?? false,
    },
  });

  return NextResponse.json({ guest }, { status: 201 });
}

export const GET = withErrorLogging(GETHandler);
export const POST = withErrorLogging(POSTHandler);
