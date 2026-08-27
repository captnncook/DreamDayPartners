import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendMail, teamInviteEmail } from "@/lib/mail";
import { withErrorLogging } from "@/lib/apiErrorLogging";

// Een teamlid uitnodigen (bijv. een meeregelende ouder) mag alleen door
// iemand die zelf al volledige toegang tot deze bruiloft heeft — niet door
// een leverancier (die heeft hier sowieso geen zicht op via deze route).
async function assertCanInvite(userId: string, weddingId: string) {
  const membership = await prisma.weddingTeamMember.findUnique({
    where: { weddingId_userId: { weddingId, userId } },
  });
  return !!membership && ["couple", "planner", "admin"].includes(membership.role);
}

async function GETHandler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  if (!(await assertCanInvite(user.id, id))) return NextResponse.json({ invites: [] });

  const invites = await prisma.weddingTeamInvite.findMany({
    where: { weddingId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invites });
}

async function POSTHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  if (!(await assertCanInvite(user.id, id))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "E-mailadres is verplicht" }, { status: 400 });
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const alreadyMember = await prisma.weddingTeamMember.findUnique({
      where: { weddingId_userId: { weddingId: id, userId: existingUser.id } },
    });
    if (alreadyMember) return NextResponse.json({ error: "Deze persoon is al teamlid van deze bruiloft" }, { status: 409 });
    // Bestaat het account al (bijv. als leverancier)? Dan direct koppelen,
    // geen nieuwe uitnodigingsflow nodig.
    await prisma.weddingTeamMember.create({
      data: { weddingId: id, userId: existingUser.id, role: "team_member" },
    });
    return NextResponse.json({ directlyLinked: true }, { status: 201 });
  }

  const wedding = await prisma.wedding.findUnique({ where: { id }, select: { title: true } });
  if (!wedding) return NextResponse.json({ error: "Bruiloft niet gevonden" }, { status: 404 });

  const token = randomBytes(24).toString("base64url");
  const invite = await prisma.weddingTeamInvite.create({
    data: { weddingId: id, email: normalizedEmail, invitedByName: user.name, token },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const acceptUrl = `${appUrl}/teamlid-uitnodiging/${token}`;
  const tpl = teamInviteEmail(user.name, wedding.title, acceptUrl);
  await sendMail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ invite }, { status: 201 });
}

async function DELETEHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  if (!(await assertCanInvite(user.id, id))) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { inviteId } = await req.json();
  if (!inviteId) return NextResponse.json({ error: "inviteId ontbreekt" }, { status: 400 });

  await prisma.weddingTeamInvite.deleteMany({ where: { id: inviteId, weddingId: id } });
  return NextResponse.json({ ok: true });
}

export const GET = withErrorLogging(GETHandler);
export const POST = withErrorLogging(POSTHandler);
export const DELETE = withErrorLogging(DELETEHandler);
