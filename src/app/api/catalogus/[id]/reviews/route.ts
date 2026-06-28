import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.vendorReview.findMany({
    where: { vendorId: id },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { weddingId, rating, text } = await req.json();
  if (!weddingId || !rating) return NextResponse.json({ error: "Bruiloft en beoordeling zijn verplicht" }, { status: 400 });

  // verify user is part of this wedding
  const member = await prisma.weddingTeamMember.findFirst({ where: { weddingId, userId: user.id } });
  if (!member) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const review = await prisma.vendorReview.upsert({
    where: { vendorId_weddingId_authorId: { vendorId: id, weddingId, authorId: user.id } },
    update: { rating, text: text || null },
    create: { vendorId: id, weddingId, authorId: user.id, rating, text: text || null },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ review });
}
