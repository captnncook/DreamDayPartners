import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildIcsCalendar, type IcsEvent } from "@/lib/ics";

// Publieke, token-geauthenticeerde .ics-feed voor een draaiboek — bedoeld
// om te abonneren vanuit Google Calendar / Apple Kalender / Outlook.
// Geen sessie-cookie nodig: agenda-apps pollen server-naar-server.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token ontbreekt" }, { status: 401 });

  const user = await prisma.user.findFirst({ where: { calendarToken: token }, select: { id: true, role: true } });
  if (!user) return NextResponse.json({ error: "Ongeldig token" }, { status: 401 });

  const accessWhere =
    user.role === "admin"
      ? { id }
      : user.role === "vendor"
      ? { id, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({ where: accessWhere, select: { id: true, title: true, date: true } });
  if (!wedding) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const draaiboeken = await prisma.draaiboek.findMany({
    where: { weddingId: id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  let ownVendorId: string | null = null;
  if (user.role === "vendor") {
    const vendor = await prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true } });
    ownVendorId = vendor?.id ?? null;
  }

  const events: IcsEvent[] = [];
  for (const d of draaiboeken) {
    const day = d.date ? new Date(d.date) : new Date(wedding.date);
    for (const item of d.items) {
      if (user.role === "vendor" && !item.isPublic && item.vendorId !== ownVendorId && !item.visibleVendorIds.includes(ownVendorId ?? "")) {
        continue;
      }
      const [h, m] = item.startTime.split(":").map(Number);
      const start = new Date(day);
      start.setHours(h, m, 0, 0);
      events.push({
        uid: item.id,
        title: item.title,
        description: item.notes ?? item.description ?? null,
        location: item.location ?? null,
        start,
        durationMinutes: item.duration,
      });
    }
  }

  const ics = buildIcsCalendar(`Draaiboek: ${wedding.title}`, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="draaiboek.ics"`,
      "Cache-Control": "no-cache",
    },
  });
}
