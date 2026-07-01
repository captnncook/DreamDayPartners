import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    if (!body.name?.trim()) return NextResponse.json({ error: "Naam verplicht" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (body.emailNewMessage !== undefined) data.emailNewMessage = !!body.emailNewMessage;
  if (body.emailNewTask !== undefined) data.emailNewTask = !!body.emailNewTask;
  if (body.emailWeddingUpdate !== undefined) data.emailWeddingUpdate = !!body.emailWeddingUpdate;
  if (body.emailWeeklyDigest !== undefined) data.emailWeeklyDigest = !!body.emailWeeklyDigest;

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ user: updated });
}
