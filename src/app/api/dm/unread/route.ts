import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/dm/unread — returns total count of unread DM messages
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ count: 0 });

  const participants = await prisma.directConversationParticipant.findMany({
    where: { userId: user.id },
    select: { conversationId: true, lastReadAt: true },
  });

  let total = 0;
  await Promise.all(
    participants.map(async (p) => {
      const count = await prisma.directMessage.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: user.id },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      });
      total += count;
    })
  );

  return NextResponse.json({ count: total });
}
