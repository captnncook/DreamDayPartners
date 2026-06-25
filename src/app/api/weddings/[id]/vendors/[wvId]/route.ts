import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { authorizeWeddingVendor } from "@/lib/vendorAuth";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

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

  return NextResponse.json({ booking: wv });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const body = await req.json();

  // Status and payment fields: planner/admin only
  const isPlannerPatch =
    body.status !== undefined ||
    body.depositAmount !== undefined ||
    body.depositDue !== undefined ||
    body.depositPaid !== undefined ||
    body.finalAmount !== undefined ||
    body.finalDue !== undefined ||
    body.finalPaid !== undefined;

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

  return NextResponse.json({ booking: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  if (!["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  await prisma.weddingVendor.delete({ where: { id: wvId } });
  return NextResponse.json({ ok: true });
}
