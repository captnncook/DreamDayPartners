import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const request = await prisma.vendorClaimRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
  if (request.status !== "pending") return NextResponse.json({ error: "Aanvraag is al verwerkt" }, { status: 409 });

  await prisma.vendorClaimRequest.update({
    where: { id },
    data: { status: "rejected", decidedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
