import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendMail, newDirectMessageEmail } from "@/lib/mail";

type Params = { params: Promise<{ id: string }> };

async function authorize(userId: string, convId: string) {
  const participant = await prisma.directConversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: convId, userId } },
  });
  return !!participant;
}

// GET /api/dm/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  if (!(await authorize(user.id, id))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const messages = await prisma.directMessage.findMany({
    where: {
      conversationId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

// POST /api/dm/conversations/[id]/messages
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  if (!(await authorize(user.id, id))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Leeg bericht" }, { status: 400 });

  const [message] = await prisma.$transaction([
    prisma.directMessage.create({
      data: { conversationId: id, senderId: user.id, content: content.trim() },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.directConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  // Notify other participants via email if they have emailNewMessage enabled
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const others = await prisma.directConversationParticipant.findMany({
    where: { conversationId: id, NOT: { userId: user.id } },
    include: { user: true },
  });
  for (const p of others) {
    if (p.user.emailNewMessage && p.user.email) {
      const tpl = newDirectMessageEmail(user.name, content.trim().slice(0, 200), appUrl);
      await sendMail({ to: p.user.email, subject: tpl.subject, html: tpl.html });
    }
  }

  return NextResponse.json({ message }, { status: 201 });
}
