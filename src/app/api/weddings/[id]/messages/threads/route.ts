import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { type = "internal", subject } = await req.json();

  const thread = await prisma.messageThread.create({
    data: { weddingId: id, type, subject: subject || null },
    include: { messages: { include: { sender: true } } },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
