import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.vendorReview.findMany({
    where: { vendorId: id },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

function toRating(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n);
}

async function POSTImpl(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { weddingId, ratingQuality, ratingCommunication, ratingReliability, ratingValue, wouldRecommend, text } = await req.json();
  const ratings = {
    ratingQuality: toRating(ratingQuality),
    ratingCommunication: toRating(ratingCommunication),
    ratingReliability: toRating(ratingReliability),
    ratingValue: toRating(ratingValue),
  };
  if (!weddingId || Object.values(ratings).some((r) => r === null)) {
    return NextResponse.json({ error: "Bruiloft en alle beoordelingen zijn verplicht" }, { status: 400 });
  }

  // verify user is part of this wedding
  const member = await prisma.weddingTeamMember.findFirst({ where: { weddingId, userId: user.id } });
  if (!member) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const data = {
    ratingQuality: ratings.ratingQuality!,
    ratingCommunication: ratings.ratingCommunication!,
    ratingReliability: ratings.ratingReliability!,
    ratingValue: ratings.ratingValue!,
    wouldRecommend: Boolean(wouldRecommend),
    text: text || null,
  };

  const review = await prisma.vendorReview.upsert({
    where: { vendorId_weddingId_authorId: { vendorId: id, weddingId, authorId: user.id } },
    update: data,
    create: { vendorId: id, weddingId, authorId: user.id, ...data },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ review });
}

export const GET = withErrorLogging(GETImpl);
export const POST = withErrorLogging(POSTImpl);
