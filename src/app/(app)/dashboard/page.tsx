import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { FREE_WEDDING_LIMIT } from "@/lib/pricing";
import { getServerLang } from "@/lib/server-lang";

function daysUntil(date: Date) {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const { t } = await getServerLang();

  let weddings: Awaited<ReturnType<typeof prisma.wedding.findMany>>;

  if (user.role === "admin") {
    // Admin-dashboard draait om accountverzoeken en platformactiviteit, niet om bruiloften
    // (die staan in de sidebar onder "Bruiloften").
    weddings = [];
  } else if (user.role === "vendor") {
    weddings = await prisma.wedding.findMany({
      where: { vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 50,
    });
  } else {
    weddings = await prisma.wedding.findMany({
      where: { teamMembers: { some: { userId: user.id } } },
      include: { owner: true, teamMembers: { include: { user: true } } },
      orderBy: { date: "asc" },
    });
  }

  // Couple users: show all wedding tasks (not just ones assigned to them)
  // Other roles: show tasks assigned to them
  const coupleWeddingIds = user.role === "couple" ? weddings.map(w => w.id) : [];
  const myTasks = user.role !== "vendor" ? await prisma.task.findMany({
    where: user.role === "couple"
      ? { weddingId: { in: coupleWeddingIds }, status: { not: "done" } }
      : { assignedTo: user.id, status: { not: "done" } },
    include: { wedding: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  }) : [];

  // For couple: also get total task counts for progress display
  const taskCounts = user.role === "couple" && coupleWeddingIds.length > 0 ? await prisma.task.groupBy({
    by: ["status"],
    where: { weddingId: { in: coupleWeddingIds } },
    _count: true,
  }) : [];

  // Openstaande Dream Team-uitnodigingen voor leveranciers.
  const vendorRequests = user.role === "vendor" ? await prisma.weddingVendor.findMany({
    where: { status: "invited", vendor: { userId: user.id } },
    include: { wedding: true },
    orderBy: { createdAt: "desc" },
  }) : [];

  const requestsData = vendorRequests.map((wv) => ({
    id: wv.id,
    weddingTitle: wv.wedding.title,
    weddingVenue: wv.wedding.venue,
    weddingDate: wv.wedding.date.toISOString(),
    weddingEndDate: wv.wedding.endDate?.toISOString() ?? null,
  }));

  const firstName = user.name.split(" ")[0];
  const greetings: Record<string, string> = {
    admin: t.dashboardPage.greetingAdmin,
    planner: t.dashboardPage.greetingMorning.replace("{name}", firstName),
    team_member: t.dashboardPage.greetingMorning.replace("{name}", firstName),
    couple: t.dashboardPage.greetingCoupleWelcome,
    vendor: t.dashboardPage.greetingVendorWelcome,
  };

  const stats = {
    total: weddings.length,
    upcoming30: weddings.filter((w) => daysUntil(w.date) <= 30 && daysUntil(w.date) >= 0).length,
    thisYear: weddings.filter((w) => new Date(w.date).getFullYear() === new Date().getFullYear()).length,
  };

  const weddingsData = weddings.map((w) => ({
    id: w.id,
    title: w.title,
    venue: w.venue,
    date: w.date.toISOString(),
    endDate: w.endDate ? w.endDate.toISOString() : null,
    status: w.status,
    days: daysUntil(w.date),
  }));

  const tasksData = myTasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString(),
    weddingId: t.weddingId,
    weddingTitle: t.wedding.title,
  }));

  const totalTasks = taskCounts.reduce((s, g) => s + g._count, 0);
  const doneTasks = taskCounts.find(g => g.status === "done")?._count ?? 0;

  // Gratis leveranciersaccounts mogen maximaal FREE_WEDDING_LIMIT bruiloften
  // tegelijk in hun dashboard hebben — daarna tonen we een permanente
  // upgrade-melding i.p.v. ze zomaar te laten groeien.
  let vendorWeddingLimitInfo: { atLimit: boolean; count: number; limit: number } | null = null;
  if (user.role === "vendor" && !user.isPremium) {
    const count = weddings.length; // al gefilterd op portalAccess: true hierboven
    vendorWeddingLimitInfo = { atLimit: count >= FREE_WEDDING_LIMIT, count, limit: FREE_WEDDING_LIMIT };
  }

  // Naderende betaaldeadlines (feitelijk, uit echte boekingsdata):
  // onbetaalde aanbetalingen/eindbetalingen die binnen 14 dagen vervallen of al
  // verlopen zijn. Alleen voor rollen die betalingen beheren.
  let paymentDeadlines: { wvId: string; weddingId: string; vendorName: string; label: string; due: string; days: number }[] = [];
  if (["couple", "planner", "team_member"].includes(user.role) && weddings.length > 0) {
    const horizon = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const bookings = await prisma.weddingVendor.findMany({
      where: {
        weddingId: { in: weddings.map((w) => w.id) },
        OR: [
          { depositPaid: false, depositDue: { not: null, lte: horizon } },
          { finalPaid: false, finalDue: { not: null, lte: horizon } },
        ],
      },
      include: { vendor: { select: { name: true } } },
    });
    for (const b of bookings) {
      if (!b.depositPaid && b.depositDue && b.depositDue <= horizon) {
        paymentDeadlines.push({ wvId: b.id, weddingId: b.weddingId, vendorName: b.vendor.name, label: t.dashboardPage.deposit, due: b.depositDue.toISOString(), days: daysUntil(b.depositDue) });
      }
      if (!b.finalPaid && b.finalDue && b.finalDue <= horizon) {
        paymentDeadlines.push({ wvId: b.id, weddingId: b.weddingId, vendorName: b.vendor.name, label: t.dashboardPage.finalPayment, due: b.finalDue.toISOString(), days: daysUntil(b.finalDue) });
      }
    }
    paymentDeadlines = paymentDeadlines.sort((a, b) => a.days - b.days).slice(0, 4);
  }

  // Setup-voortgang voor het bruidspaar: echte, al voltooide acties tellen mee
  // als voortgang (goal gradient) — nooit verzonnen stappen.
  let coupleSetup = null;
  if (user.role === "couple" && weddings[0]) {
    const weddingId = weddings[0].id;
    const [guestCount, vendorCount, draaiboekCount, budget] = await Promise.all([
      prisma.guest.count({ where: { weddingId } }),
      prisma.weddingVendor.count({ where: { weddingId } }),
      prisma.draaiboek.count({ where: { weddingId } }),
      prisma.budget.findUnique({ where: { weddingId }, select: { totalAmount: true } }),
    ]);
    coupleSetup = {
      weddingId,
      hasBudget: (budget?.totalAmount ?? 0) > 0,
      hasTasks: totalTasks > 0,
      hasGuests: guestCount > 0,
      hasVendors: vendorCount > 0,
      hasDraaiboek: draaiboekCount > 0,
    };
  }

  // Voor het bruidspaar: als de eerste bruiloft al is geweest, tonen we de
  // leveranciers die eraan meewerkten met een review-uitnodiging.
  let pastWeddingVendors: { wvId: string; vendorId: string; name: string; category: string; reviewLinkUrl: string | null; myReview: { ratingQuality: number; ratingCommunication: number; ratingReliability: number; ratingValue: number; wouldRecommend: boolean; text: string | null } | null }[] = [];
  if (user.role === "couple" && weddings[0] && daysUntil(weddings[0].date) < 0) {
    const weddingId = weddings[0].id;
    const bookings = await prisma.weddingVendor.findMany({
      where: { weddingId, status: "confirmed" },
      include: {
        vendor: {
          select: {
            id: true, name: true, category: true, reviewLinkUrl: true,
            reviews: { where: { weddingId, authorId: user.id } },
          },
        },
      },
    });
    pastWeddingVendors = bookings.map((b) => ({
      wvId: b.id,
      vendorId: b.vendor.id,
      name: b.vendor.name,
      category: b.vendor.category,
      reviewLinkUrl: b.vendor.reviewLinkUrl,
      myReview: b.vendor.reviews[0]
        ? {
            ratingQuality: b.vendor.reviews[0].ratingQuality,
            ratingCommunication: b.vendor.reviews[0].ratingCommunication,
            ratingReliability: b.vendor.reviews[0].ratingReliability,
            ratingValue: b.vendor.reviews[0].ratingValue,
            wouldRecommend: b.vendor.reviews[0].wouldRecommend,
            text: b.vendor.reviews[0].text,
          }
        : null,
    }));
  }

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, role: user.role }}
      greeting={greetings[user.role] ?? t.dashboardPage.greetingDefault}
      stats={stats}
      weddings={weddingsData}
      tasks={tasksData}
      taskProgress={user.role === "couple" ? { total: totalTasks, done: doneTasks } : undefined}
      vendorRequests={requestsData}
      coupleSetup={coupleSetup}
      paymentDeadlines={paymentDeadlines}
      pastWeddingVendors={pastWeddingVendors}
      vendorWeddingLimitInfo={vendorWeddingLimitInfo}
    />
  );
}
