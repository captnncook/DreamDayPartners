import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, rsvpConfirmationEmail } from "@/lib/mail";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wedding = await prisma.wedding.findUnique({
    where: { rsvpToken: token },
    select: { id: true, title: true, date: true, venue: true },
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ wedding });
}

type GuestInput = { name: string; isChild: boolean; dietary: string };

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const { email, rsvpStatus, guests } = body as { email?: string; rsvpStatus: string; guests: GuestInput[] };

  const wedding = await prisma.wedding.findUnique({ where: { rsvpToken: token }, select: { id: true, title: true, date: true, venue: true } });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guestList: GuestInput[] = Array.isArray(guests) && guests.length > 0
    ? guests
    : [{ name: "Gast", isChild: false, dietary: "" }];

  const created = await Promise.all(
    guestList.map((g, i) =>
      prisma.guest.create({
        data: {
          weddingId: wedding.id,
          name: g.name?.trim() || "Gast",
          email: i === 0 ? (email || null) : null,
          rsvpStatus: rsvpStatus ?? "confirmed",
          dietary: g.dietary?.trim() || null,
          isChild: Boolean(g.isChild),
        },
      })
    )
  );

  if (email) {
    const tpl = rsvpConfirmationEmail(wedding.title, new Date(wedding.date), wedding.venue, rsvpStatus === "confirmed", guestList.map((g) => g.name));
    await sendMail({ to: email, subject: tpl.subject, html: tpl.html, role: "couple" });
  }

  return NextResponse.json({ guests: created });
}
