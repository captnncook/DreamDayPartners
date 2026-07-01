import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pendingId, code } = body as { pendingId: string; code: string };

  if (!pendingId || !code) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string; email: string; type: string; data: string;
    code: string; codeExpiresAt: Date; verified: boolean;
  }>>(
    `SELECT * FROM "pending_registrations" WHERE id = $1`,
    pendingId
  );

  const pending = rows[0];
  if (!pending) {
    return NextResponse.json({ error: "Aanvraag niet gevonden. Start opnieuw." }, { status: 404 });
  }
  if (pending.verified) {
    return NextResponse.json({ error: "Al geverifieerd." }, { status: 409 });
  }
  if (new Date() > new Date(pending.codeExpiresAt)) {
    return NextResponse.json({ error: "De code is verlopen. Vraag een nieuwe aan." }, { status: 410 });
  }
  if (pending.code !== code.trim()) {
    return NextResponse.json({ error: "Onjuiste code. Probeer het opnieuw." }, { status: 422 });
  }

  const verifiedToken = randomBytes(32).toString("base64url");

  await prisma.$executeRawUnsafe(
    `UPDATE "pending_registrations" SET verified = true, "verifiedToken" = $1 WHERE id = $2`,
    verifiedToken,
    pendingId
  );

  return NextResponse.json({ verifiedToken });
}
