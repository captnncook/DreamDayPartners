import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { authorizeWeddingVendor } from "@/lib/vendorAuth";
import { syncIntakeTasks } from "@/lib/intakeTasks";

type Params = { params: Promise<{ id: string; wvId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const wv = await prisma.weddingVendor.findUnique({
    where: { id: wvId },
    include: {
      vendor: true,
      deliverables: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      draaiboekItems: { orderBy: { startTime: "asc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });

  // Also fetch public draaiboek items for this wedding (visible to all vendors)
  const publicItems = await prisma.draaiboekItem.findMany({
    where: {
      isPublic: true,
      draaiboek: { weddingId },
    },
    orderBy: { startTime: "asc" },
  });

  // Merge: vendor-specific items + public items (deduplicate by id)
  const vendorItemIds = new Set((wv?.draaiboekItems ?? []).map(i => i.id));
  const mergedItems = [
    ...(wv?.draaiboekItems ?? []),
    ...publicItems.filter(i => !vendorItemIds.has(i.id)),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Gastenaantal: VendorDashboardInline (de inline weergave op de
  // bruiloftspagina) haalt alles via deze route op, dus zonder dit hier mee
  // te sturen blijft de couvert-calculator/gastgegevens-paneel altijd op 0
  // staan voor de leverancier, ook als het bruidspaar al gasten heeft.
  const guests = await prisma.guest.findMany({
    where: { weddingId },
    select: { id: true, name: true, dietary: true, rsvpStatus: true, side: true },
  });

  return NextResponse.json({
    booking: { ...wv, draaiboekItems: mergedItems },
    guests,
    totalGuests: guests.length,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  const body = await req.json();

  // Status wijzigen blijft aan het team van de bruiloft voorbehouden.
  if (body.status !== undefined && !["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Betaalbedragen: ContractPayment.tsx staat dit UI-zijdig expliciet toe aan
  // vendor/couple/planner (canEdit = isPlanner || isVendor || isCouple) —
  // deze check moet daarmee in de pas lopen, anders faalt de leverancier of
  // het bruidspaar hier stil op een 403 zonder dat de UI dat meldt.
  const isAmountPatch =
    body.depositAmount !== undefined ||
    body.depositDue !== undefined ||
    body.finalAmount !== undefined ||
    body.finalDue !== undefined;

  if (isAmountPatch && !["admin", "planner", "team_member", "vendor", "couple"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Welke intake/logistics-velden de leverancier graag ingevuld ziet: alleen
  // de leverancier zelf bepaalt dat voor de eigen boeking.
  if (body.requiredIntakeKeys !== undefined && user.role !== "vendor") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Paid toggles are allowed for all authenticated users (vendor marks own invoice paid)

  const updated = await prisma.weddingVendor.update({
    where: { id: wvId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.portalAccess !== undefined && { portalAccess: body.portalAccess }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.depositAmount !== undefined && { depositAmount: body.depositAmount }),
      ...(body.depositDue !== undefined && { depositDue: body.depositDue ? new Date(body.depositDue) : null }),
      ...(body.depositPaid !== undefined && { depositPaid: body.depositPaid }),
      ...(body.finalAmount !== undefined && { finalAmount: body.finalAmount }),
      ...(body.finalDue !== undefined && { finalDue: body.finalDue ? new Date(body.finalDue) : null }),
      ...(body.finalPaid !== undefined && { finalPaid: body.finalPaid }),
      ...(body.requiredIntakeKeys !== undefined && { requiredIntakeKeys: body.requiredIntakeKeys }),
    },
    include: { vendor: true },
  });

  if (body.requiredIntakeKeys !== undefined) {
    await syncIntakeTasks(wvId);
  }

  return NextResponse.json({ booking: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  if (!["admin", "planner", "team_member"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id: weddingId, wvId } = await params;
  const auth = await authorizeWeddingVendor(user, wvId, weddingId);
  if (!auth.ok) return auth.response;

  await prisma.weddingVendor.delete({ where: { id: wvId } });
  return NextResponse.json({ ok: true });
}
