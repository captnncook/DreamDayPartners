import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType") ?? "";
  const targetId = searchParams.get("targetId") ?? "";
  if (!targetType || !targetId) return NextResponse.json({ error: "targetType en targetId verplicht" }, { status: 400 });

  const notes = await prisma.adminNote.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "desc" },
  });
  const authorIds = [...new Set(notes.map((n) => n.authorId))];
  const authors = await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } });
  const authorName = new Map(authors.map((a) => [a.id, a.name]));

  return NextResponse.json({
    notes: notes.map((n) => ({ ...n, authorName: authorName.get(n.authorId) ?? "?" })),
  });
}

async function POSTImpl(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { targetType, targetId, text } = body ?? {};
  if (!targetType || !targetId || !text?.trim()) {
    return NextResponse.json({ error: "targetType, targetId en text verplicht" }, { status: 400 });
  }

  const note = await prisma.adminNote.create({
    data: { targetType, targetId, text: text.trim(), authorId: user.id },
  });

  return NextResponse.json({ note: { ...note, authorName: user.name } });
}

export const GET = withErrorLogging(GETImpl);
export const POST = withErrorLogging(POSTImpl);
