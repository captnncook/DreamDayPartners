import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; wvId: string; deliverableId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId, deliverableId } = await params;

  const booking = await prisma.weddingVendor.findFirst({ where: { id: wvId, weddingId } });
  if (!booking) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const canEdit =
    ["admin", "planner", "team_member"].includes(user.role) ||
    (user.role === "vendor" && booking.vendorId !== null);

  if (!canEdit) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await req.json();
  const deliverable = await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.approvalRequired !== undefined && { approvalRequired: body.approvalRequired }),
      ...(body.label !== undefined && { label: body.label }),
    },
  });

  return NextResponse.json({ deliverable });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  if (!["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { deliverableId } = await params;
  await prisma.deliverable.delete({ where: { id: deliverableId } });
  return NextResponse.json({ ok: true });
}
