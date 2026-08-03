import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Geeft de persoonlijke agenda-abonnee-URL (.ics) terug voor een bruiloft,
// en genereert lazy een calendarToken voor de gebruiker als die nog ontbreekt.
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) return NextResponse.json({ error: "weddingId ontbreekt" }, { status: 400 });

  let token = (await prisma.user.findUnique({ where: { id: user.id }, select: { calendarToken: true } }))?.calendarToken;
  if (!token) {
    token = randomBytes(24).toString("base64url");
    await prisma.user.update({ where: { id: user.id }, data: { calendarToken: token } });
  }

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const path = `/api/weddings/${weddingId}/draaiboek/ics?token=${token}`;
  const httpsUrl = `${proto}://${host}${path}`;
  const webcalUrl = `webcal://${host}${path}`;

  return NextResponse.json({ httpsUrl, webcalUrl });
}
