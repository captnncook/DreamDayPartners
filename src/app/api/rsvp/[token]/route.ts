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

  // Bestaande gasten van deze bruiloft ophalen om te matchen op naam/e-mail
  // i.p.v. blind nieuwe rijen aan te maken — anders ontstaat er een
  // duplicaat zodra iemand die al op de gastenlijst staat zelf RSVP't.
  const existingGuests = await prisma.guest.findMany({ where: { weddingId: wedding.id } });
  function findMatch(name: string, isFirst: boolean) {
    const normalized = name.trim().toLowerCase();
    return existingGuests.find((g) => {
      if (g.name.trim().toLowerCase() === normalized) return true;
      if (isFirst && email && g.email && g.email.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });
  }

  // Sequentieel (niet Promise.all) zodat matches binnen dezelfde aanvraag
  // elkaar niet kunnen dubbel claimen bij twee gasten met dezelfde naam.
  const created = [];
  for (let i = 0; i < guestList.length; i++) {
    const g = guestList[i];
    const name = g.name?.trim() || "Gast";
    const match = findMatch(name, i === 0);
    const data = {
      name,
      email: i === 0 ? (email || null) : null,
      rsvpStatus: rsvpStatus ?? "confirmed",
      dietary: g.dietary?.trim() || null,
      isChild: Boolean(g.isChild),
    };
    if (match) {
      created.push(await prisma.guest.update({ where: { id: match.id }, data }));
      existingGuests.splice(existingGuests.indexOf(match), 1);
    } else {
      created.push(await prisma.guest.create({ data: { ...data, weddingId: wedding.id } }));
    }
  }

  if (email) {
    const tpl = rsvpConfirmationEmail(wedding.title, new Date(wedding.date), wedding.venue, rsvpStatus === "confirmed", guestList.map((g) => g.name));
    await sendMail({ to: email, subject: tpl.subject, html: tpl.html, role: "couple" });
  }

  return NextResponse.json({ guests: created });
}
