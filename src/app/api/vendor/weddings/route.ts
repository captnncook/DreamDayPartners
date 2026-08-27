import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOwnVendorId, canGrantVendorPortalAccess } from "@/lib/vendorAuth";
import { generateWeddingCode, generateRsvpSlug } from "@/lib/wedding-id";
import { withErrorLogging } from "@/lib/apiErrorLogging";

async function GETImpl() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ invites: [] });

  const [invites, allLinks] = await Promise.all([
    prisma.vendorWeddingInvite.findMany({
      where: { vendorId },
      include: { wedding: { select: { id: true, title: true, date: true, endDate: true } } },
      orderBy: { weddingDate: "asc" },
    }),
    // Ook niet-goedgekeurde koppelingen ophalen (portalAccess: false), zodat
    // een "In afwachting van goedkeuring"-status getoond kan worden i.p.v.
    // stilzwijgend te doen alsof er nog niets gebeurd is.
    prisma.weddingVendor.findMany({
      where: { vendorId },
      select: { id: true, weddingId: true, status: true, portalAccess: true, wedding: { select: { id: true, title: true, date: true, endDate: true } } },
    }),
  ]);
  const portalAccessByWeddingId = new Map(allLinks.map(wv => [wv.weddingId, wv.portalAccess]));
  const directLinks = allLinks; // alle koppelingen, incl. wachtend op goedkeuring

  // Merge: invites take precedence; add direct links that have no corresponding invite
  const inviteWeddingIds = new Set(invites.map(i => i.weddingId).filter(Boolean));
  const extra = directLinks
    .filter(wv => !inviteWeddingIds.has(wv.weddingId))
    .map(wv => ({
      id: `wv-${wv.id}`,
      email1: "",
      email2: null,
      weddingDate: wv.wedding.date.toISOString(),
      weddingTitle: wv.wedding.title,
      notes: null,
      weddingId: wv.weddingId,
      wedding: wv.wedding,
      vendorStatus: wv.status,
      portalAccess: wv.portalAccess,
      createdAt: wv.wedding.date.toISOString(),
      source: "direct" as const,
    }));

  const allInvites = [
    ...invites.map(i => ({ ...i, vendorStatus: undefined, portalAccess: portalAccessByWeddingId.get(i.weddingId ?? "") ?? null, source: "invite" as const })),
    ...extra,
  ].sort((a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime());

  return NextResponse.json({ invites: allInvites });
}

async function POSTImpl(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "vendor") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const vendorId = await getOwnVendorId(user.id);
  if (!vendorId) return NextResponse.json({ error: "Geen leveranciersprofiel gevonden" }, { status: 400 });

  const { email1, email2, weddingDate, weddingTitle, notes } = await req.json();
  if (!email1 || !weddingDate) {
    return NextResponse.json({ error: "E-mailadres en trouwdatum zijn verplicht" }, { status: 400 });
  }

  const e1 = email1.toLowerCase();
  const e2 = email2 ? email2.toLowerCase() : null;

  const date = new Date(weddingDate);
  date.setUTCHours(0, 0, 0, 0);

  // Matchen op e-mail alleen (niet ook op exacte datum): e-mail is de
  // betrouwbare identifier, een datum die de leverancier iets anders heeft
  // dan wat het bruidspaar zelf heeft geregistreerd (typfout, of nog niet
  // zeker) mag geen aparte, duplicaat-bruiloft opleveren.
  let wedding = await prisma.wedding.findFirst({
    where: {
      OR: [
        { coupleEmail1: e1 }, { coupleEmail2: e1 },
        ...(e2 ? [{ coupleEmail1: e2 }, { coupleEmail2: e2 }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const alreadyExisted = !!wedding;

  if (!wedding) {
    // Create a placeholder wedding so the vendor has a dashboard right away
    const title = weddingTitle?.trim() || `Bruiloft ${new Date(date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}`;
    const weddingCode = generateWeddingCode(e1, e2 ?? e1, weddingDate);

    const existing = await prisma.wedding.findUnique({ where: { weddingCode } });
    if (existing) {
      wedding = existing;
    } else {
      wedding = await prisma.wedding.create({
        data: {
          weddingCode,
          rsvpToken: generateRsvpSlug(title),
          title,
          date,
          coupleEmail1: e1,
          coupleEmail2: e2 ?? "",
          ownerId: user.id,
          notes,
        },
      });
      await prisma.budget.create({ data: { weddingId: wedding.id, totalAmount: 0 } });
    }
  }

  // Link vendor to the wedding — alleen blokkeren als dit een nieuwe bruiloft is
  // (een al gekoppelde bruiloft opnieuw doorgeven mag altijd).
  const existingLink = await prisma.weddingVendor.findUnique({
    where: { weddingId_vendorId: { weddingId: wedding.id, vendorId } },
    select: { portalAccess: true },
  });
  if (!existingLink?.portalAccess && !(await canGrantVendorPortalAccess(vendorId))) {
    return NextResponse.json({ error: "Je hebt het maximum aantal bruiloften voor je account bereikt. Upgrade naar Premium om meer bruiloften toe te voegen.", code: "wedding_limit_reached" }, { status: 403 });
  }

  // Voor een bruiloft die de leverancier hier zelf net als plaatshouder heeft
  // aangemaakt (ownerId === deze leverancier) is directe toegang logisch.
  // Maar als het e-mailadres matcht met een bruiloft van een ECHT, al
  // aangemeld bruidspaar, kreeg de leverancier voorheen zonder enige
  // toestemming meteen volledige portaltoegang — alleen op basis van het
  // kennen van een e-mailadres. Die koppeling moet net als een Dream
  // Team-uitnodiging pas na goedkeuring (via de bestaande "Portal"-knop bij
  // Leveranciers) toegang geven.
  const isOwnPlaceholder = wedding.ownerId === user.id;
  const grantPortalNow = !alreadyExisted || isOwnPlaceholder || existingLink?.portalAccess === true;

  await prisma.weddingVendor.upsert({
    where: { weddingId_vendorId: { weddingId: wedding.id, vendorId } },
    update: grantPortalNow ? { portalAccess: true } : {},
    create: { weddingId: wedding.id, vendorId, status: grantPortalNow ? "lead" : "invited", portalAccess: grantPortalNow },
  });

  if (!grantPortalNow && !existingLink) {
    await prisma.notification.create({
      data: {
        userId: wedding.ownerId,
        weddingId: wedding.id,
        type: "vendor_invite",
        content: "Een leverancier heeft aangegeven jullie bruiloft te beheren en vraagt om portaltoegang. Geef toegang bij Leveranciers.",
        relatedType: "weddingVendor",
        relatedId: wedding.id,
      },
    });
  }

  // Store the invite for future matching (if couple signs up later)
  const invite = await prisma.vendorWeddingInvite.create({
    data: {
      vendorId,
      email1: e1,
      email2: e2,
      weddingDate: date,
      weddingTitle: weddingTitle || null,
      notes: notes || null,
      weddingId: wedding.id,
    },
    include: { wedding: { select: { id: true, title: true, date: true } } },
  });

  return NextResponse.json({ invite, matched: alreadyExisted, pendingApproval: !grantPortalNow }, { status: 201 });
}

export const GET = withErrorLogging(GETImpl);
export const POST = withErrorLogging(POSTImpl);
