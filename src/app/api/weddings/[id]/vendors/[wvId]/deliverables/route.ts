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

  const deliverables = await prisma.deliverable.findMany({
    where: { vendorBookingId: wvId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ deliverables });
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  if (!["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const deliverable = await prisma.deliverable.create({
    data: {
      vendorBookingId: wvId,
      key: body.key,
      label: body.label,
      status: body.status ?? "pending",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      approvalRequired: body.approvalRequired ?? false,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ deliverable }, { status: 201 });
}
