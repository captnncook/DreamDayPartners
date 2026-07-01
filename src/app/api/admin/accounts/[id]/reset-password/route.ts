import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSession();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$executeRawUnsafe(
    `INSERT INTO "password_reset_tokens" (id, "userId", token, "expiresAt")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId") DO UPDATE SET token = $3, "expiresAt" = $4, "createdAt" = NOW()`,
    randomBytes(8).toString("hex"),
    target.id,
    token,
    expiresAt
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const resetUrl = `${appUrl}/wachtwoord-reset/${token}`;

  await sendMail({
    to: target.email,
    subject: "Stel je wachtwoord in voor DreamDay Partners",
    html: `
      <p>Je ontvangt deze e-mail omdat een beheerder een wachtwoordreset heeft aangevraagd voor jouw account.</p>
      <p>Klik op onderstaande knop om een (nieuw) wachtwoord in te stellen. Deze link is <strong>1 uur</strong> geldig.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Wachtwoord instellen
        </a>
      </p>
      <p style="color:#888;font-size:0.9em;">Werkt de knop niet? Kopieer deze link: ${resetUrl}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
