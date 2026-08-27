import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// POST /api/dm/conversations/[id]/read — mark conversation as read for current user
async function POSTImpl(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;

  await prisma.directConversationParticipant.updateMany({
    where: { conversationId: id, userId: user.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export const POST = withErrorLogging(POSTImpl);
