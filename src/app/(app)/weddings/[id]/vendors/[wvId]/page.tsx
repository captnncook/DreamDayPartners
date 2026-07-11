import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DashboardEngine from "@/components/vendor-modules/DashboardEngine";

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
    select: { title: true, id: true },
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
    select: { id: true, name: true, dietary: true, rsvpStatus: true, side: true },
  });

  const totalGuests = guests.length;

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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Back navigation */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href={`/weddings/${weddingId}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", color: "var(--muted)", textDecoration: "none" }}
        >
          <ChevronLeft size={16} />
          {wedding.title}
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem", background: "var(--blush-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
            {booking.vendor.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "-0.02em" }}>
              {booking.vendor.name}
            </h1>
            <div style={{ fontSize: "0.875rem", color: "var(--muted)", textTransform: "capitalize" }}>
              {booking.vendor.category}
              {booking.vendor.city && ` · ${booking.vendor.city}`}
            </div>
          </div>
          {booking.vendor.email && (
            <a href={`mailto:${booking.vendor.email}`} style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>
              Contact
            </a>
          )}
        </div>
      </div>

      <DashboardEngine
        weddingId={weddingId}
        wvId={wvId}
        vendorType={booking.vendor.category}
        initialBooking={isBookingSerializer(booking)}
        documents={serializedDocuments}
        timelineBlocks={serializedBlocks}
        tasks={serializedTasks}
        guests={guests}
        totalGuests={totalGuests}
        userRole={user.role}
        userId={user.id}
        vendorUserId={booking.vendor.userId}
        vendorIsPremium={booking.vendor.isPremium}
        vendorDisabledModules={booking.vendor.disabledModules}
        vendorExtraModules={booking.vendor.extraModules}
      />
    </div>
  );
}
