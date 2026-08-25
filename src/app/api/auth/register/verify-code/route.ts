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
    code: string; codeExpiresAt: Date; verified: boolean; verifiedToken: string | null;
  }>>(
    `SELECT * FROM "pending_registrations" WHERE id = $1`,
    pendingId
  );

  const pending = rows[0];
  if (!pending) {
    // Kan gebeuren als deze aanvraag al eerder succesvol is afgerond (account
    // bestaat al) en de client per ongeluk nogmaals dezelfde stap uitvoert —
    // niet meteen alarmerend als "kapot", vandaar de zachtere tekst.
    return NextResponse.json({ error: "Deze aanmelding is al verwerkt of verlopen. Probeer in te loggen, of start hieronder opnieuw." }, { status: 404 });
  }
  if (pending.verified) {
    // Geen echte fout: als je (bv. door dubbelklikken of terugnavigeren)
    // dezelfde al-geverifieerde code nogmaals indient, kun je gewoon door
    // naar de volgende stap — geef daarom het bestaande token terug i.p.v.
    // een foutmelding die de gebruiker vast laat lopen.
    return NextResponse.json({ verifiedToken: pending.verifiedToken, alreadyVerified: true });
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
