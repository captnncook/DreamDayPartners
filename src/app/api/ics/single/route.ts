import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";
import { buildIcsCalendar } from "@/lib/ics";

// Genereert een los .ics-bestand voor één datum (bijv. een proefsessie of
// pasafspraak) zodat die met één klik in de eigen agenda-app gezet kan
// worden — los van het draaiboek-abonnement, dat over de hele bruiloftsdag
// gaat en niet over dit soort losse, vooraf geplande momenten.
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { title, date, description } = await req.json();
  if (!title || !date) return NextResponse.json({ error: "Titel en datum zijn verplicht" }, { status: 400 });

  const start = new Date(date);
  if (isNaN(start.getTime())) return NextResponse.json({ error: "Ongeldige datum" }, { status: 400 });

  const ics = buildIcsCalendar(title, [{
    uid: randomUUID(),
    title,
    description: description || null,
    start,
    durationMinutes: 60,
  }]);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title.replace(/[^a-z0-9]+/gi, "-")}.ics"`,
    },
  });
}
