import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { resolveParticipantBadges } from "@/lib/participantBadge";

// GET /api/dm/conversations — list all DM conversations for current user
export async function GET(_req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const convs = await prisma.directConversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true, avatar: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const allUserIds = convs.flatMap((c) => c.participants.map((p) => p.user.id));
  const badges = await resolveParticipantBadges(allUserIds);

  const enriched = convs.map((c) => ({
    ...c,
    participants: c.participants.map((p) => ({
      ...p,
      user: { ...p.user, ...(badges.get(p.user.id) ?? {}) },
    })),
  }));

  return NextResponse.json({ conversations: enriched });
}

// POST /api/dm/conversations — get or create a DM conversation with another user
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { otherUserId } = await req.json();
  if (!otherUserId || otherUserId === user.id) {
    return NextResponse.json({ error: "Ongeldig" }, { status: 400 });
  }

  // Find existing conversation between these two users
  const existing = await prisma.directConversation.findFirst({
    where: {
      participants: { some: { userId: user.id } },
      AND: { participants: { some: { userId: otherUserId } } },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
    },
  });

  if (existing) {
    // Count participants — only return if exactly 2 (no group chats)
    if (existing.participants.length === 2) {
      return NextResponse.json({ conversation: existing });
    }
  }

  // Create new conversation
  const conv = await prisma.directConversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: otherUserId }],
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
    },
  });

  return NextResponse.json({ conversation: conv }, { status: 201 });
}
