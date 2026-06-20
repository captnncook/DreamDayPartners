import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  let threadFilter: object = { weddingId: id };

  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    threadFilter = {
      weddingId: id,
      OR: [{ type: "internal" }, { vendorId: vendor?.id }],
    };
  }

  const threads = await prisma.messageThread.findMany({
    where: threadFilter,
    include: {
      messages: {
        include: { sender: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ threads });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: _id } = await params;
  const { threadId, content } = await req.json();

  if (!threadId || !content) {
    return NextResponse.json({ error: "threadId en content verplicht" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { threadId, senderId: user.id, content },
    include: { sender: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
