import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Feitelijke gegevens voor de rol-specifieke "weet je het zeker?"-stap van
// het bruidspaar: vóór de trouwdag tonen we wat er verloren gaat (loss
// aversion, eerlijk); ná de trouwdag vragen we om een afscheidscijfer en
// reviews per leverancier.
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "couple") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const wedding = await prisma.wedding.findFirst({
    where: { teamMembers: { some: { userId: user.id } } },
    select: { id: true, title: true, date: true },
  });

  if (!wedding) {
    return NextResponse.json({ wedding: null });
  }

  const [openTasks, totalTasks, guests, draaiboekItems, vendors, budget, otherCoupleMembers] = await Promise.all([
    prisma.task.count({ where: { weddingId: wedding.id, status: { not: "done" } } }),
    prisma.task.count({ where: { weddingId: wedding.id } }),
    prisma.guest.count({ where: { weddingId: wedding.id } }),
    prisma.draaiboekItem.count({ where: { draaiboek: { weddingId: wedding.id } } }),
    prisma.weddingVendor.findMany({
      where: { weddingId: wedding.id },
      include: { vendor: { select: { id: true, name: true, category: true } } },
    }),
    prisma.budget.findUnique({ where: { weddingId: wedding.id }, select: { totalAmount: true } }),
    prisma.weddingTeamMember.count({ where: { weddingId: wedding.id, role: "couple", userId: { not: user.id } } }),
  ]);

  // Zelfde 6 stappen als de dashboard-checklist: echte voortgang.
  const setupSteps = [
    true, // bruiloft aangemaakt
    (budget?.totalAmount ?? 0) > 0,
    totalTasks > 0,
    guests > 0,
    vendors.length > 0,
    draaiboekItems > 0,
  ];
  const setupPercent = Math.round((setupSteps.filter(Boolean).length / setupSteps.length) * 100);

  return NextResponse.json({
    wedding: {
      id: wedding.id,
      title: wedding.title,
      date: wedding.date.toISOString(),
      isPast: wedding.date < new Date(),
    },
    openTasks,
    guests,
    draaiboekItems,
    setupPercent,
    partnerHasAccount: otherCoupleMembers > 0,
    dreamTeam: vendors.map((wv) => ({ vendorId: wv.vendor.id, name: wv.vendor.name, category: wv.vendor.category })),
  });
}
