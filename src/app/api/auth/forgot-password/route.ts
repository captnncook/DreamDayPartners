import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mailadres verplicht" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return ok to prevent email enumeration
  if (!user || !user.passwordHash) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$executeRawUnsafe(
    `INSERT INTO "password_reset_tokens" (id, "userId", token, "expiresAt")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId") DO UPDATE SET token = $3, "expiresAt" = $4, "createdAt" = NOW()`,
    randomBytes(8).toString("hex"),
    user.id,
    token,
    expiresAt
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const resetUrl = `${appUrl}/wachtwoord-reset/${token}`;

  await sendMail({
    to: user.email,
    subject: "Wachtwoord opnieuw instellen",
    html: `
      <p>Je hebt gevraagd om je wachtwoord opnieuw in te stellen voor DreamDay Partners.</p>
      <p>Klik op onderstaande knop om een nieuw wachtwoord te kiezen. Deze link is <strong>1 uur</strong> geldig.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Nieuw wachtwoord instellen
        </a>
      </p>
      <p style="color:#888;font-size:0.9em;">Werkt de knop niet? Kopieer deze link: ${resetUrl}</p>
      <p style="color:#888;font-size:0.9em;">Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
