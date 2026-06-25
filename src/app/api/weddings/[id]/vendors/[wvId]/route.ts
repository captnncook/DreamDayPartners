import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { wvId } = await params;
  const wv = await prisma.weddingVendor.findUnique({
    where: { id: wvId },
    include: {
      vendor: true,
      deliverables: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      draaiboekItems: { orderBy: { startTime: "asc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!wv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking: wv });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;

  const booking = await prisma.weddingVendor.findFirst({ where: { id: wvId, weddingId } });
  if (!booking) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const body = await req.json();

  // Planner-only fields
  const isPlannerPatch = body.status !== undefined || body.depositAmount !== undefined || body.depositDue !== undefined || body.depositPaid !== undefined || body.finalAmount !== undefined || body.finalDue !== undefined || body.finalPaid !== undefined;
  if (isPlannerPatch && !["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.portalAccess !== undefined && { portalAccess: body.portalAccess }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.depositAmount !== undefined && { depositAmount: body.depositAmount }),
      ...(body.depositDue !== undefined && { depositDue: body.depositDue ? new Date(body.depositDue) : null }),
      ...(body.depositPaid !== undefined && { depositPaid: body.depositPaid }),
      ...(body.finalAmount !== undefined && { finalAmount: body.finalAmount }),
      ...(body.finalDue !== undefined && { finalDue: body.finalDue ? new Date(body.finalDue) : null }),
      ...(body.finalPaid !== undefined && { finalPaid: body.finalPaid }),
    },
    include: { vendor: true },
  });

  return NextResponse.json({ booking: updated, vendor: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { wvId } = await params;
  await prisma.weddingVendor.delete({ where: { id: wvId } });
  return NextResponse.json({ ok: true });
}
