import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail, premiumGrantedEmail } from "@/lib/mail";
import { logAdminEvent } from "@/lib/adminEvent";

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

  if (body.vendorType !== undefined && target.role === "vendor") {
    data.vendorType = body.vendorType || null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, isPremium: true, name: true, vendorType: true },
  });

  // Vendor.isPremium (catalogus-sortering/badge op /leveranciers) staat los
  // van User.isPremium — zonder deze sync verandert een admin-toggle hier
  // niets aan de zichtbare listing.
  if (body.isPremium !== undefined) {
    await prisma.vendor.updateMany({ where: { userId: id }, data: { isPremium: Boolean(body.isPremium) } });
  }

  // Send premium granted email when toggling on
  if (body.isPremium === true && !target.isPremium) {
    const tpl = premiumGrantedEmail(updated.name, updated.vendorType);
    await sendMail({ to: updated.email, subject: tpl.subject, html: tpl.html, role: "vendor", name: updated.name });
  }

  if (body.email !== undefined && target.email !== updated.email) {
    await logAdminEvent("email_change", `E-mailadres van ${updated.name} gewijzigd: ${target.email} → ${updated.email}`, updated.email);
  }

  if (body.vendorType !== undefined && target.vendorType !== updated.vendorType) {
    await logAdminEvent("vendor_type_change", `Leverancierstype van ${updated.name} gewijzigd: ${target.vendorType ?? "—"} → ${updated.vendorType ?? "—"}`, updated.email);
  }

  return NextResponse.json({ user: updated });
}
