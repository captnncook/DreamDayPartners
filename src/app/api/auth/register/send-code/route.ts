import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, verificationCodeEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, type, data } = body as { email: string; type: string; data: Record<string, unknown> };

  if (!email || !type || !data) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Er bestaat al een account met dit e-mailadres. Log in om verder te gaan." }, { status: 409 });
  }

  // Clean up old pending registrations for this email
  await prisma.$executeRawUnsafe(
    `DELETE FROM "pending_registrations" WHERE email = $1 AND "createdAt" < NOW() - INTERVAL '1 hour'`,
    email.toLowerCase()
  );

  const code = generateCode();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const id = randomBytes(16).toString("hex");

  await prisma.$executeRawUnsafe(
    `INSERT INTO "pending_registrations" (id, email, type, data, code, "codeExpiresAt") VALUES ($1, $2, $3, $4, $5, $6)`,
    id,
    email.toLowerCase(),
    type,
    JSON.stringify(data),
    code,
    codeExpiresAt
  );

  const tpl = verificationCodeEmail(code);
  await sendMail({ to: email, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ pendingId: id });
}
