import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import { syncIntakeTasks } from "@/lib/intakeTasks";
import VendorBookingClient from "./VendorBookingClient";

export default async function VendorBookingPage({
  params,
}: {
  params: Promise<{ id: string; wvId: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id: weddingId, wvId } = await params;

  // Toegangscontrole: alleen leden van deze bruiloft (of de gekoppelde
  // leverancier zelf, of admin) mogen dit dashboard zien.
  const accessWhere =
    user.role === "admin"
      ? { id: weddingId }
      : user.role === "vendor"
      ? { id: weddingId, vendors: { some: { vendor: { userId: user.id }, portalAccess: true } } }
      : { id: weddingId, teamMembers: { some: { userId: user.id } } };

  const wedding = await prisma.wedding.findFirst({
    where: accessWhere,
    select: { title: true, id: true, date: true, endDate: true },
  });
  if (!wedding) return notFound();

  const booking = await prisma.weddingVendor.findFirst({
    where: { id: wvId, weddingId },
    include: {
      vendor: true,
      draaiboekItems: {
        orderBy: { startTime: "asc" },
        include: { draaiboek: { select: { title: true } } },
      },
      tasks: { orderBy: { dueDate: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) return notFound();

  const guests = await prisma.guest.findMany({
    where: { weddingId },
    select: { id: true, name: true, dietary: true, allergies: true, rsvpStatus: true, side: true },
  });

  // Gegevens van de gekoppelde trouwlocatie (vermogen, water, sluitingstijd,
  // etc.) staan één keer op het locatieprofiel — andere leveranciers van
  // deze bruiloft (DJ, band, cateraar...) hoeven er dan niet los naar te
  // vragen, ze zien het gewoon in hun eigen dashboard.
  let venueInfo: {
    name: string; closingTime: string | null; soundLimit: string | null;
    venueFacilities: string[]; accessibility: string[]; outdoorCeremonyPossible: boolean;
    setupTime: string | null; teardownTime: string | null; badWeatherPlan: string | null; outdoorSoundRule: string | null;
  } | null = null;
  if (booking.vendor.category !== "trouwlocatie") {
    const venueBooking = await prisma.weddingVendor.findFirst({
      where: { weddingId, vendor: { category: "trouwlocatie" } },
      include: {
        vendor: {
          select: {
            name: true, closingTime: true, soundLimit: true, venueFacilities: true, accessibility: true,
            outdoorCeremonyPossible: true, setupTime: true, teardownTime: true, badWeatherPlan: true, outdoorSoundRule: true,
          },
        },
      },
    });
    if (venueBooking) {
      const overrides = (venueBooking.intakeData ?? {}) as Record<string, unknown>;
      const setupOverride = typeof overrides.setupTimeOverride === "string" ? overrides.setupTimeOverride : "";
      const teardownOverride = typeof overrides.teardownTimeOverride === "string" ? overrides.teardownTimeOverride : "";
      venueInfo = {
        ...venueBooking.vendor,
        setupTime: setupOverride || venueBooking.vendor.setupTime,
        teardownTime: teardownOverride || venueBooking.vendor.teardownTime,
      };

      // Wat de trouwlocatie al heeft ingevuld (water/koeling/toegangstijd)
      // hoeft deze leverancier niet nog eens apart te beantwoorden — schrijf
      // het automatisch in hun eigen intakegegevens zodra dat nog leeg is,
      // zodat eventuele bijbehorende taken ook meteen worden afgevinkt.
      const currentIntake = (booking.intakeData ?? {}) as Record<string, unknown>;
      const autoFill: Record<string, unknown> = {};
      if (venueInfo.venueFacilities.includes("Water aanwezig") && !currentIntake["water-venue"]) autoFill["water-venue"] = true;
      if (venueInfo.venueFacilities.includes("Koeling aanwezig") && !currentIntake["koeling-venue"]) autoFill["koeling-venue"] = true;
      if (venueInfo.setupTime && !currentIntake["toegang-venue"]) autoFill["toegang-venue"] = venueInfo.setupTime;
      if (venueInfo.teardownTime && !currentIntake["afbouw-venue"]) autoFill["afbouw-venue"] = venueInfo.teardownTime;
      if (venueInfo.badWeatherPlan && !currentIntake["weerplan-venue"]) autoFill["weerplan-venue"] = venueInfo.badWeatherPlan;

      if (Object.keys(autoFill).length > 0) {
        const merged = { ...currentIntake, ...autoFill };
        await prisma.weddingVendor.update({ where: { id: wvId }, data: { intakeData: merged as Prisma.InputJsonValue } });
        booking.intakeData = merged as Prisma.JsonValue;
        await syncIntakeTasks(wvId);
      }
    }
  }

  const totalGuests = guests.length;

  // Andere leveranciers op dezelfde bruiloft, zodat bv. een fotograaf en
  // videograaf elkaar kunnen vinden voor onderlinge afstemming i.p.v. los
  // van elkaar te moeten uitzoeken wie er nog meer bij deze bruiloft
  // betrokken is.
  const otherVendorBookings = user.role === "vendor"
    ? await prisma.weddingVendor.findMany({
        where: { weddingId, id: { not: wvId }, portalAccess: true },
        select: { vendor: { select: { id: true, name: true, category: true, email: true, phone: true } } },
      })
    : [];
  const otherVendors = otherVendorBookings.map((wv) => wv.vendor);

  const isBookingSerializer = (b: typeof booking) => ({
    status: b.status,
    depositAmount: b.depositAmount,
    depositDue: b.depositDue?.toISOString() ?? null,
    depositPaid: b.depositPaid,
    finalAmount: b.finalAmount,
    finalDue: b.finalDue?.toISOString() ?? null,
    finalPaid: b.finalPaid,
    contractUrl: b.contractUrl,
    intakeData: b.intakeData as Record<string, unknown> | null,
    requiredIntakeKeys: b.requiredIntakeKeys,
  });

  const serializedBlocks = booking.draaiboekItems.map(item => ({
    id: item.id,
    startTime: item.startTime,
    duration: item.duration,
    title: item.title,
    description: item.description,
    location: item.location,
    phase: item.phase,
  }));

  const serializedTasks = booking.tasks.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate?.toISOString() ?? null,
    priority: t.priority,
  }));

  const serializedDocuments = booking.documents.map(d => ({
    id: d.id,
    name: d.name,
    fileKey: d.fileKey,
    mimeType: d.mimeType,
    fileSize: d.fileSize,
    category: d.category,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <VendorBookingClient
      weddingId={weddingId}
      weddingTitle={wedding.title}
      weddingDate={wedding.date.toISOString()}
      weddingEndDate={wedding.endDate ? wedding.endDate.toISOString() : null}
      booking={{
        id: booking.id,
        specificDate: booking.specificDate ? booking.specificDate.toISOString() : null,
        vendor: {
          id: booking.vendor.id,
          name: booking.vendor.name,
          category: booking.vendor.category,
          city: booking.vendor.city,
          email: booking.vendor.email,
          setupTime: booking.vendor.setupTime,
          teardownTime: booking.vendor.teardownTime,
        },
      }}
      otherVendors={otherVendors}
      dashboardEngineProps={{
        weddingId,
        wvId,
        vendorId: booking.vendor.id,
        vendorType: booking.vendor.category,
        vendorName: booking.vendor.name,
        initialBooking: isBookingSerializer(booking),
        documents: serializedDocuments,
        timelineBlocks: serializedBlocks,
        tasks: serializedTasks,
        guests,
        totalGuests,
        userRole: user.role,
        userId: user.id,
        userName: user.name,
        vendorUserId: booking.vendor.userId,
        vendorIsPremium: booking.vendor.isPremium,
        vendorDisabledModules: booking.vendor.disabledModules,
        vendorExtraModules: booking.vendor.extraModules,
        venueInfo,
        logisticsDefaults:
          booking.vendor.category === "trouwlocatie"
            ? {
                setupTimeOverride: booking.vendor.setupTime ? `${booking.vendor.setupTime} (standaard)` : undefined,
                teardownTimeOverride: booking.vendor.teardownTime ? `${booking.vendor.teardownTime} (standaard)` : undefined,
              }
            : undefined,
      }}
    />
  );
}
