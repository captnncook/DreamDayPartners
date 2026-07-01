import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail, premiumGrantedEmail } from "@/lib/mail";

// DELETE — verwijder account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  if (id === user.id) return NextResponse.json({ error: "Je kunt je eigen account niet verwijderen" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH — e-mailadres en/of isPremium wijzigen
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (body.email !== undefined) {
    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Dit e-mailadres is al in gebruik" }, { status: 409 });
    }
    data.email = email;
  }

  if (body.isPremium !== undefined) {
    data.isPremium = Boolean(body.isPremium);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, isPremium: true, name: true, vendorType: true },
  });

  // Send premium granted email when toggling on
  if (body.isPremium === true && !target.isPremium) {
    const tpl = premiumGrantedEmail(updated.name, updated.vendorType);
    await sendMail({ to: updated.email, subject: tpl.subject, html: tpl.html, role: "vendor", name: updated.name });
  }

  return NextResponse.json({ user: updated });
}
