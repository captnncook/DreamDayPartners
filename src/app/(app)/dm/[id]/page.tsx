import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DmChat from "./DmChat";
import { resolveParticipantBadges } from "@/lib/participantBadge";
import { translations } from "@/lib/i18n";

export default async function DmConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const conv = await prisma.directConversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true } } } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" as const },
        take: 100,
      },
    },
  });

  if (!conv) notFound();
  const isParticipant = conv.participants.some(p => p.userId === user.id);
  if (!isParticipant) notFound();

  const other = conv.participants.find(p => p.userId !== user.id)?.user;
  const badges = other ? await resolveParticipantBadges([other.id]) : new Map();
  const otherWithBadge = other ? { ...other, ...(badges.get(other.id) ?? {}) } : other;

  const serializedMessages = conv.messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <DmChat
      conversationId={id}
      currentUserId={user.id}
      otherUser={otherWithBadge ?? { id: "", name: translations.nl.dm.unknown, role: "" }}
      initialMessages={serializedMessages}
    />
  );
}
