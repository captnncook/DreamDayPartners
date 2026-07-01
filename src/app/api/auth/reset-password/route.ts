import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string; userId: string; token: string; expiresAt: Date;
  }>>(
    `SELECT * FROM "password_reset_tokens" WHERE token = $1`,
    token
  );

  const row = rows[0];
  if (!row) return NextResponse.json({ error: "Ongeldige of verlopen link" }, { status: 404 });
  if (new Date() > new Date(row.expiresAt)) {
    return NextResponse.json({ error: "De link is verlopen. Vraag een nieuwe aan." }, { status: 410 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.update({
    where: { id: row.userId },
    data: { passwordHash },
  });

  await prisma.$executeRawUnsafe(
    `DELETE FROM "password_reset_tokens" WHERE "userId" = $1`,
    row.userId
  );

  await setSession(row.userId);
  return NextResponse.json({ ok: true });
}
