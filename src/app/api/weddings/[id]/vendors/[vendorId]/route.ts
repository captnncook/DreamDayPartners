import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string; vendorId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { vendorId } = await params;
  const wv = await prisma.weddingVendor.findUnique({
    where: { id: vendorId },
    include: { vendor: true },
  });
  if (!wv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ weddingVendor: wv });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { vendorId } = await params;
  const body = await req.json();

  const wv = await prisma.weddingVendor.update({
    where: { id: vendorId },
    data: {
      ...(body.portalAccess !== undefined && { portalAccess: body.portalAccess }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { vendor: true },
  });

  return NextResponse.json({ vendor: wv });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { vendorId } = await params;
  await prisma.weddingVendor.delete({ where: { id: vendorId } });
  return NextResponse.json({ ok: true });
}
