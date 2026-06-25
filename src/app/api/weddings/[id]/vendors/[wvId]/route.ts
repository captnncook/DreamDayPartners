import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;

  const booking = await prisma.weddingVendor.findFirst({ where: { id: wvId, weddingId } });
  if (!booking) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  if (!["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.depositAmount !== undefined && { depositAmount: body.depositAmount }),
      ...(body.depositDue !== undefined && { depositDue: body.depositDue ? new Date(body.depositDue) : null }),
      ...(body.depositPaid !== undefined && { depositPaid: body.depositPaid }),
      ...(body.finalAmount !== undefined && { finalAmount: body.finalAmount }),
      ...(body.finalDue !== undefined && { finalDue: body.finalDue ? new Date(body.finalDue) : null }),
      ...(body.finalPaid !== undefined && { finalPaid: body.finalPaid }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json({ booking: updated });
}
