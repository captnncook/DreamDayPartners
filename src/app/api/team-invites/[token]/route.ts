import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.weddingTeamInvite.findUnique({
    where: { token },
    include: { wedding: { select: { title: true } } },
  });

  if (!invite) return NextResponse.json({ error: "Uitnodiging niet gevonden" }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Deze uitnodiging is al geaccepteerd" }, { status: 410 });

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) return NextResponse.json({ error: "Er bestaat al een account met dit e-mailadres. Log in om verder te gaan." }, { status: 409 });

  return NextResponse.json({
    weddingId: invite.weddingId,
    weddingTitle: invite.wedding.title,
    invitedByName: invite.invitedByName,
    email: invite.email,
  });
}
