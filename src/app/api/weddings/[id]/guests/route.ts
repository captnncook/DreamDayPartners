import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const guest = await prisma.guest.create({
    data: {
      weddingId: id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      side: body.side ?? "both",
      rsvpStatus: body.rsvpStatus ?? "invited",
      dietary: body.dietary,
      plusOne: body.plusOne ?? false,
    },
  });

  return NextResponse.json({ guest }, { status: 201 });
}
