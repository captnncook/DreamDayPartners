import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { guestId } = await params;
  const body = await req.json();

  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      side: body.side,
      rsvpStatus: body.rsvpStatus,
      dietary: body.dietary,
      plusOne: body.plusOne,
      tableId: body.tableId,
    },
  });

  return NextResponse.json({ guest });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { guestId } = await params;
  await prisma.guest.delete({ where: { id: guestId } });
  return NextResponse.json({ ok: true });
}
