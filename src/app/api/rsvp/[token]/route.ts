import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wedding = await prisma.wedding.findUnique({
    where: { rsvpToken: token },
    select: { id: true, title: true, date: true, venue: true },
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ wedding });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const { name, email, rsvpStatus, dietary, plusOne } = body;
  const wedding = await prisma.wedding.findUnique({ where: { rsvpToken: token }, select: { id: true } });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const guest = await prisma.guest.create({
    data: {
      weddingId: wedding.id,
      name: name ?? "Gast",
      email: email ?? null,
      rsvpStatus: rsvpStatus ?? "confirmed",
      dietary: dietary ?? null,
      plusOne: plusOne ?? false,
    },
  });
  return NextResponse.json({ guest });
}
