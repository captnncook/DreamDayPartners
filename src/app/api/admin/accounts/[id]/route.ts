import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// DELETE — verwijder account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  if (id === user.id) return NextResponse.json({ error: "Je kunt je eigen account niet verwijderen" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH — e-mailadres wijzigen
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mailadres verplicht" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "Dit e-mailadres is al in gebruik" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { email: email.toLowerCase() },
    select: { id: true, email: true },
  });

  return NextResponse.json({ user: updated });
}
