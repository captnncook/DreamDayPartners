import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const request = await prisma.vendorFeatureRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Verzoek niet gevonden" }, { status: 404 });
  if (request.status !== "pending") return NextResponse.json({ error: "Verzoek is al afgehandeld" }, { status: 409 });

  const updated = await prisma.vendorFeatureRequest.update({
    where: { id },
    data: { status: "rejected", decidedAt: new Date(), decidedBy: user.email ?? user.id },
  });

  return NextResponse.json({ request: updated });
}
