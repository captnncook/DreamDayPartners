import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function PUTHandler(req: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
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
      allergies: body.allergies,
      plusOne: body.plusOne,
      isChild: body.isChild,
      tableId: body.tableId,
    },
  });

  return NextResponse.json({ guest });
}

async function DELETEHandler(_req: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { guestId } = await params;
  await prisma.guest.delete({ where: { id: guestId } });
  return NextResponse.json({ ok: true });
}

export const PUT = withErrorLogging(PUTHandler);
export const DELETE = withErrorLogging(DELETEHandler);
