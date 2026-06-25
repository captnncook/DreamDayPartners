import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;

  const booking = await prisma.weddingVendor.findFirst({
    where: { id: wvId, weddingId },
    include: { vendor: true },
  });
  if (!booking) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const canEdit =
    user.role === "admin" ||
    user.role === "planner" ||
    user.role === "team_member" ||
    (user.role === "vendor" && booking.vendor.userId === user.id);
  if (!canEdit) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: { intakeData: body.intakeData },
  });

  return NextResponse.json({ booking: updated });
}
