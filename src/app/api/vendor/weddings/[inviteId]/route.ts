import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";

type Params = { params: Promise<{ inviteId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { inviteId } = await params;
  const invite = await prisma.vendorWeddingInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.vendorId !== vendorId) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  await prisma.vendorWeddingInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ ok: true });
}
