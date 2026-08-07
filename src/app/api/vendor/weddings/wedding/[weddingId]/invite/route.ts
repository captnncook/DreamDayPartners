import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId } from "@/lib/vendorAuth";
import { sendMail, coupleWeddingInviteEmail } from "@/lib/mail";

type Params = { params: Promise<{ weddingId: string }> };

// Stuurt met één klik een uitnodiging naar het bruidspaar om een DreamDay-
// account aan te maken voor een bruiloft die de leverancier zelf al heeft
// geregistreerd (zie /mijn-bruiloften).
export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 400 });

  const { weddingId } = await params;

  const link = await prisma.weddingVendor.findUnique({
    where: { weddingId_vendorId: { weddingId, vendorId } },
    select: { id: true },
  });
  if (!link) return NextResponse.json({ error: "Geen toegang tot deze bruiloft" }, { status: 403 });

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { title: true, date: true, coupleEmail1: true, coupleEmail2: true },
  });
  if (!wedding) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { name: true } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamdaypartners-production.up.railway.app";
  const dateStr = wedding.date.toISOString().split("T")[0];

  const recipients = [wedding.coupleEmail1, wedding.coupleEmail2].filter(
    (e): e is string => !!e && !e.endsWith("@dreamday.local")
  );
  if (recipients.length === 0) {
    return NextResponse.json({ error: "Geen geldig e-mailadres bekend voor het bruidspaar" }, { status: 400 });
  }

  for (const email of recipients) {
    const inviteUrl = `${appUrl}/aanmelden?type=couple&email=${encodeURIComponent(email)}&date=${dateStr}`;
    const tpl = coupleWeddingInviteEmail(vendor?.name ?? "Jullie leverancier", wedding.title, inviteUrl);
    await sendMail({ to: email, subject: tpl.subject, html: tpl.html, role: "couple" });
  }

  return NextResponse.json({ ok: true, sentTo: recipients });
}
