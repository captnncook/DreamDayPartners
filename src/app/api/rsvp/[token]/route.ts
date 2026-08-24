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

type GuestInput = { name: string; isChild: boolean; dietary: string; allergies?: string };

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const { email, rsvpStatus, guests } = body as { email?: string; rsvpStatus: string; guests: GuestInput[] };

  if (!email || !email.trim()) {
    return NextResponse.json({ error: "E-mailadres is verplicht." }, { status: 400 });
  }

  const wedding = await prisma.wedding.findUnique({ where: { rsvpToken: token }, select: { id: true, title: true, date: true, venue: true } });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guestList: GuestInput[] = Array.isArray(guests) && guests.length > 0
    ? guests
    : [{ name: "Gast", isChild: false, dietary: "", allergies: "" }];

  // Naam-matching alleen (case/whitespace/diakrieten-ongevoelig) is te
  // broos tegen kleine schrijfvarianten — normaliseren voorkomt dat "Marieke
  // de Vries" en "Marieke  de  Vríes" als twee verschillende gasten worden
  // gezien en dus dubbel in de lijst belanden.
  function normalize(name: string) {
    return name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
  }

  // Bestaande gasten van deze bruiloft ophalen om te matchen op naam/e-mail
  // i.p.v. blind nieuwe rijen aan te maken — anders ontstaat er een
  // duplicaat zodra iemand die al op de gastenlijst staat zelf RSVP't.
  const existingGuests = await prisma.guest.findMany({ where: { weddingId: wedding.id } });
  function findMatch(name: string, isFirst: boolean) {
    const normalized = normalize(name);
    // E-mail is nu verplicht voor de indiener zelf, dus een match op e-mail
    // (ongeacht naamspelling) is de sterkste garantie tegen duplicaten.
    if (isFirst) {
      const byEmail = existingGuests.find((g) => g.email && g.email.toLowerCase() === email!.toLowerCase());
      if (byEmail) return byEmail;
    }
    const exact = existingGuests.find((g) => normalize(g.name) === normalized);
    if (exact) return exact;
    // Alleen voor de indiener zelf: bij een transliteratie-/typfoutvariant
    // (bv. "Yuki Tanaka" ingetypt op de RSVP terwijl de gastenlijst al "Yui
    // Tanaka" bevat) is een enkele, ondubbelzinnige bijna-match nog steeds
    // beter dan een harde duplicaat-rij. Alleen toepassen als er precies één
    // kandidaat binnen bereik ligt, om nooit twee verschillende gasten samen
    // te voegen.
    if (isFirst && normalized.length >= 4) {
      const close = existingGuests.filter((g) => {
        const cand = normalize(g.name);
        const maxDist = normalized.length > 8 ? 2 : 1;
        return levenshtein(normalized, cand) <= maxDist;
      });
      if (close.length === 1) return close[0];
    }
    return undefined;
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
      allergies: g.allergies?.trim() || null,
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
