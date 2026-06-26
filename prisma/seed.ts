import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Demo users
  const admin = await prisma.user.upsert({
    where: { email: "admin@dreamday.nl" },
    update: {},
    create: { email: "admin@dreamday.nl", name: "Platform Admin", role: "admin", isPremium: true },
  });

  const planner = await prisma.user.upsert({
    where: { email: "planner@dreamday.nl" },
    update: {},
    create: { email: "planner@dreamday.nl", name: "Sophie van der Berg", role: "planner", isPremium: true },
  });

  const couple1 = await prisma.user.upsert({
    where: { email: "emma@example.nl" },
    update: {},
    create: { email: "emma@example.nl", name: "Emma de Vries", role: "couple", isPremium: false },
  });

  const couple2 = await prisma.user.upsert({
    where: { email: "thomas@example.nl" },
    update: {},
    create: { email: "thomas@example.nl", name: "Thomas Bakker", role: "couple", isPremium: false },
  });

  const bloemist = await prisma.user.upsert({
    where: { email: "bloemen@roos.nl" },
    update: {},
    create: { email: "bloemen@roos.nl", name: "Roos Janssen", role: "vendor", vendorType: "bloemist", isPremium: false },
  });

  const dj = await prisma.user.upsert({
    where: { email: "dj@beats.nl" },
    update: {},
    create: { email: "dj@beats.nl", name: "DJ Marco", role: "vendor", vendorType: "dj", isPremium: false },
  });

  const catering = await prisma.user.upsert({
    where: { email: "info@tasty.nl" },
    update: {},
    create: { email: "info@tasty.nl", name: "Tasty Events Catering", role: "vendor", vendorType: "catering", isPremium: false },
  });

  const fotograaf = await prisma.user.upsert({
    where: { email: "hallo@lichtvang.nl" },
    update: {},
    create: { email: "hallo@lichtvang.nl", name: "Lara Vermeer", role: "vendor", vendorType: "fotograaf", isPremium: true },
  });

  const videograaf = await prisma.user.upsert({
    where: { email: "info@studioeeuwig.nl" },
    update: {},
    create: { email: "info@studioeeuwig.nl", name: "Tom de Wit", role: "vendor", vendorType: "videograaf", isPremium: false },
  });

  const haarstylist = await prisma.user.upsert({
    where: { email: "studio@glowbridal.nl" },
    update: {},
    create: { email: "studio@glowbridal.nl", name: "Noa Pieters", role: "vendor", vendorType: "haarstylist", isPremium: false },
  });

  const liveband = await prisma.user.upsert({
    where: { email: "boekingen@velvetnotes.nl" },
    update: {},
    create: { email: "boekingen@velvetnotes.nl", name: "Daan Kroon", role: "vendor", vendorType: "liveband", isPremium: true },
  });

  const bakker = await prisma.user.upsert({
    where: { email: "sanne@zoetenzo.nl" },
    update: {},
    create: { email: "sanne@zoetenzo.nl", name: "Sanne Bakker", role: "vendor", vendorType: "bakker", isPremium: false },
  });

  const trouwlocatie = await prisma.user.upsert({
    where: { email: "events@dehaar.nl" },
    update: {},
    create: { email: "events@dehaar.nl", name: "Eveline Boschma", role: "vendor", vendorType: "trouwlocatie", isPremium: true },
  });

  const vervoer = await prisma.user.upsert({
    where: { email: "rijden@classiccars.nl" },
    update: {},
    create: { email: "rijden@classiccars.nl", name: "Henk Visser", role: "vendor", vendorType: "vervoer", isPremium: false },
  });

  const wpVendor = await prisma.user.upsert({
    where: { email: "hallo@foreveryours.nl" },
    update: {},
    create: { email: "hallo@foreveryours.nl", name: "Isa Mulder", role: "vendor", vendorType: "weddingplanner", isPremium: true },
  });

  // Demo wedding
  const wedding = await prisma.wedding.upsert({
    where: { weddingCode: "WED-DEMO01" },
    update: {},
    create: {
      weddingCode: "WED-DEMO01",
      title: "Bruiloft Emma & Thomas",
      date: new Date("2026-09-12"),
      venue: "Kasteel de Haar, Utrecht",
      status: "planning",
      coupleEmail1: "emma@example.nl",
      coupleEmail2: "thomas@example.nl",
      ownerId: couple1.id,
      isPremium: true,
      notes: "Thema: Romantisch Garden Party",
    },
  });

  // Team members
  for (const [userId, role] of [[planner.id, "planner"], [couple1.id, "couple"], [couple2.id, "couple"]]) {
    await prisma.weddingTeamMember.upsert({
      where: { weddingId_userId: { weddingId: wedding.id, userId } },
      update: {},
      create: { weddingId: wedding.id, userId, role },
    });
  }

  // Vendors (met prijsindicatie + coördinaten voor de kaart)
  const vendorBloemist = await prisma.vendor.upsert({
    where: { id: "vendor-bloemist-01" },
    update: { city: "Utrecht", latitude: 52.0907, longitude: 5.1214, isPremium: true, description: "Sfeervolle bruidsboeketten en complete bloemstyling voor jullie dag." },
    create: { id: "vendor-bloemist-01", name: "Bloemenwinkel Roos", category: "bloemist", contactPerson: "Roos Janssen", email: "bloemen@roos.nl", phone: "06-12345678", userId: bloemist.id, city: "Utrecht", latitude: 52.0907, longitude: 5.1214, isPremium: true, description: "Sfeervolle bruidsboeketten en complete bloemstyling voor jullie dag." },
  });
  const vendorDJ = await prisma.vendor.upsert({
    where: { id: "vendor-dj-01" },
    update: { city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, description: "Ervaren bruiloft-DJ met eigen geluids- en lichtinstallatie." },
    create: { id: "vendor-dj-01", name: "DJ Marco Productions", category: "dj", contactPerson: "Marco Pietersen", email: "dj@beats.nl", phone: "06-87654321", userId: dj.id, city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, description: "Ervaren bruiloft-DJ met eigen geluids- en lichtinstallatie." },
  });
  const vendorCatering = await prisma.vendor.upsert({
    where: { id: "vendor-catering-01" },
    update: { city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, isPremium: true, description: "Verfijnde catering op maat, van diner tot walking dinner." },
    create: { id: "vendor-catering-01", name: "Tasty Events Catering", category: "catering", contactPerson: "Maria Smit", email: "info@tasty.nl", phone: "020-9876543", userId: catering.id, city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, isPremium: true, description: "Verfijnde catering op maat, van diner tot walking dinner." },
  });

  // Extra catalogus-leveranciers met locatie zodat de kaart gevuld is
  type VendorSeed = { id: string; name: string; category: string; contactPerson: string; email: string; phone: string; city: string; latitude: number; longitude: number; isPremium: boolean; description: string; userId?: string };
  const extraVendors: VendorSeed[] = [
    { id: "vendor-fotograaf-01", name: "Lichtvang Fotografie", category: "fotograaf", contactPerson: "Lara Vermeer", email: "hallo@lichtvang.nl", phone: "06-23456789", city: "Haarlem", latitude: 52.3874, longitude: 4.6462, isPremium: true, description: "Documentaire trouwfotografie met oog voor de kleine momenten.", userId: fotograaf.id },
    { id: "vendor-videograaf-01", name: "Studio Eeuwig", category: "videograaf", contactPerson: "Tom de Wit", email: "info@studioeeuwig.nl", phone: "06-34567890", city: "Rotterdam", latitude: 51.9244, longitude: 4.4777, isPremium: false, description: "Cinematische trouwfilms die jullie verhaal vertellen.", userId: videograaf.id },
    { id: "vendor-locatie-01", name: "Kasteel de Haar Events", category: "trouwlocatie", contactPerson: "Eveline Boschma", email: "events@dehaar.nl", phone: "030-1234567", city: "Haarzuilens", latitude: 52.1153, longitude: 4.9869, isPremium: true, description: "Sprookjesachtige kasteellocatie voor een onvergetelijke bruiloft.", userId: trouwlocatie.id },
    { id: "vendor-bakker-01", name: "Zoet & Zo Taarten", category: "bakker", contactPerson: "Sanne Bakker", email: "sanne@zoetenzo.nl", phone: "06-45678901", city: "Utrecht", latitude: 52.0907, longitude: 5.1214, isPremium: false, description: "Ambachtelijke bruidstaarten, volledig naar jullie smaak.", userId: bakker.id },
    { id: "vendor-haar-01", name: "Glow Bridal Studio", category: "haarstylist", contactPerson: "Noa Pieters", email: "studio@glowbridal.nl", phone: "06-56789012", city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, isPremium: false, description: "Bruidskapsels en make-up die de hele dag perfect blijven.", userId: haarstylist.id },
    { id: "vendor-band-01", name: "The Velvet Notes", category: "liveband", contactPerson: "Daan Kroon", email: "boekingen@velvetnotes.nl", phone: "06-67890123", city: "Den Haag", latitude: 52.0705, longitude: 4.3007, isPremium: true, description: "Energieke liveband die elke dansvloer vult.", userId: liveband.id },
    { id: "vendor-vervoer-01", name: "Classic Wedding Cars", category: "vervoer", contactPerson: "Henk Visser", email: "rijden@classiccars.nl", phone: "06-78901234", city: "Rotterdam", latitude: 51.9244, longitude: 4.4777, isPremium: false, description: "Stijlvol vervoer met klassieke trouwauto's en chauffeur.", userId: vervoer.id },
    { id: "vendor-planner-01", name: "Forever Yours Weddings", category: "weddingplanner", contactPerson: "Isa Mulder", email: "hallo@foreveryours.nl", phone: "06-89012345", city: "Utrecht", latitude: 52.0907, longitude: 5.1214, isPremium: true, description: "Volledige weddingplanning, van eerste idee tot laatste dans.", userId: wpVendor.id },
  ];
  const upsertedExtra: Record<string, string> = {};
  for (const v of extraVendors) {
    const result = await prisma.vendor.upsert({
      where: { id: v.id },
      update: { city: v.city, latitude: v.latitude, longitude: v.longitude, isPremium: v.isPremium, description: v.description, userId: v.userId },
      create: v,
    });
    upsertedExtra[v.id] = result.id;
  }

  // Link all vendors to the demo wedding with portalAccess
  const allVendorLinks: [string, string, string][] = [
    [vendorBloemist.id, "booked", "Bruidsboeket wit/roze, 12 tafeldecoraties"],
    [vendorDJ.id, "in_progress", "Avondfeest 20:00-01:00, eigen geluidsinstallatie"],
    [vendorCatering.id, "lead", "Diner voor 80 personen, 3 gangen"],
    ["vendor-fotograaf-01", "booked", "Hele dag fotograferen, gouden uur shoot"],
    ["vendor-videograaf-01", "lead", "Cinematisch trouwfilm pakket"],
    ["vendor-locatie-01", "completed", "Zaalverhuur + catering arrangement"],
    ["vendor-bakker-01", "booked", "5-laagse bruidstaart, wit met bloemen"],
    ["vendor-haar-01", "in_progress", "Bruid + 3 bruidsmeisjes"],
    ["vendor-band-01", "lead", "Livemuziek ceremonie + eerste uur diner"],
    ["vendor-vervoer-01", "booked", "Rolls Royce Silver Shadow"],
    ["vendor-planner-01", "ready", "Dag-van coördinatie"],
  ];

  for (const [vendorId, status, notes] of allVendorLinks) {
    await prisma.weddingVendor.upsert({
      where: { weddingId_vendorId: { weddingId: wedding.id, vendorId } },
      update: { portalAccess: true },
      create: { weddingId: wedding.id, vendorId, status, portalAccess: true, notes },
    });
  }

  // Budget
  const budget = await prisma.budget.upsert({
    where: { weddingId: wedding.id },
    update: {},
    create: { weddingId: wedding.id, totalAmount: 25000, currency: "EUR" },
  });

  // Wipe and recreate so re-runs don't produce duplicates
  await prisma.budgetItem.deleteMany({ where: { budgetId: budget.id } });
  await prisma.budgetItem.createMany({
    data: [
      { budgetId: budget.id, category: "Locatie", description: "Kasteel de Haar zaalverhuur", estimated: 6000, actual: 6000, payStatus: "paid", vendorId: null },
      { budgetId: budget.id, category: "Catering", description: "Diner & dranken 80 personen", estimated: 8000, actual: 0, payStatus: "pending", vendorId: vendorCatering.id },
      { budgetId: budget.id, category: "Bloemen", description: "Bruidsboeket & decoratie", estimated: 2500, actual: 2500, payStatus: "deposit_paid", vendorId: vendorBloemist.id },
      { budgetId: budget.id, category: "Muziek", description: "DJ avondfeest", estimated: 1500, actual: 0, payStatus: "pending", vendorId: vendorDJ.id },
      { budgetId: budget.id, category: "Fotografie", description: "Huwelijksfotograaf", estimated: 3000, actual: 0, payStatus: "pending", vendorId: null },
      { budgetId: budget.id, category: "Kleding", description: "Bruidsjurk & pak", estimated: 2500, actual: 1800, payStatus: "paid", vendorId: null },
      { budgetId: budget.id, category: "Diversen", description: "Uitnodigingen, bedankjes etc.", estimated: 500, actual: 320, payStatus: "paid", vendorId: null },
    ],
  });

  // Tasks
  await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.task.createMany({
    data: [
      { weddingId: wedding.id, title: "Locatie definitief boeken", category: "venue", dueDate: new Date("2026-01-15"), status: "done", priority: "high", assignedTo: planner.id },
      { weddingId: wedding.id, title: "Catering offerte vergelijken", category: "catering", dueDate: new Date("2026-02-01"), status: "done", priority: "high", assignedTo: planner.id },
      { weddingId: wedding.id, title: "Uitnodigingen versturen", category: "general", dueDate: new Date("2026-03-01"), status: "done", priority: "medium", assignedTo: couple1.id },
      { weddingId: wedding.id, title: "Menu definitief bevestigen bij catering", category: "catering", dueDate: new Date("2026-07-01"), status: "open", priority: "high", assignedTo: planner.id },
      { weddingId: wedding.id, title: "Draaiboek finaliseren", category: "general", dueDate: new Date("2026-08-15"), status: "in_progress", priority: "high", assignedTo: planner.id },
      { weddingId: wedding.id, title: "Zitplaatsindeling maken", category: "general", dueDate: new Date("2026-08-01"), status: "open", priority: "medium", assignedTo: couple1.id },
      { weddingId: wedding.id, title: "DJ playlist doorgeven", category: "general", dueDate: new Date("2026-09-01"), status: "open", priority: "medium", assignedTo: couple2.id },
      { weddingId: wedding.id, title: "Bloemen finale bespreking", category: "decoration", dueDate: new Date("2026-07-15"), status: "open", priority: "medium", assignedTo: planner.id },
    ],
  });

  // Guests
  await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.guest.createMany({
    data: [
      { weddingId: wedding.id, name: "Jan de Vries", email: "jan@example.nl", side: "bride", rsvpStatus: "confirmed" },
      { weddingId: wedding.id, name: "Ria de Vries", email: "ria@example.nl", side: "bride", rsvpStatus: "confirmed", dietary: "vegetarisch" },
      { weddingId: wedding.id, name: "Piet Bakker", email: "piet@example.nl", side: "groom", rsvpStatus: "confirmed" },
      { weddingId: wedding.id, name: "Els Bakker", email: "els@example.nl", side: "groom", rsvpStatus: "confirmed" },
      { weddingId: wedding.id, name: "Sanne Willems", email: "sanne@example.nl", side: "both", rsvpStatus: "confirmed" },
      { weddingId: wedding.id, name: "Kevin Smits", email: "kevin@example.nl", side: "both", rsvpStatus: "declined" },
      { weddingId: wedding.id, name: "Laura Hendriks", email: "laura@example.nl", side: "bride", rsvpStatus: "no_response" },
      { weddingId: wedding.id, name: "Mark Jansen", email: "mark@example.nl", side: "groom", rsvpStatus: "confirmed", dietary: "glutenvrij" },
      { weddingId: wedding.id, name: "Anita Visser", email: "anita@example.nl", side: "both", rsvpStatus: "invited" },
      { weddingId: wedding.id, name: "Rob Peters", email: "rob@example.nl", side: "groom", rsvpStatus: "confirmed" },
    ],
  });

  // Draaiboek
  const draaiboek = await prisma.draaiboek.upsert({
    where: { id: "draaiboek-demo-01" },
    update: {},
    create: { id: "draaiboek-demo-01", weddingId: wedding.id, title: "Draaiboek Trouwdag 12 september 2026", version: "1.2", status: "draft" },
  });

  await prisma.draaiboekItem.deleteMany({ where: { draaiboekId: draaiboek.id } });
  await prisma.draaiboekItem.createMany({
    data: [
      { draaiboekId: draaiboek.id, startTime: "10:00", duration: 60, title: "Bruidsopkomst & voorbereiding", location: "Bruidskamer Kasteel", sortOrder: 1, vendorId: null },
      { draaiboekId: draaiboek.id, startTime: "11:00", duration: 30, title: "Bloemiste arriveert voor decoratie", location: "Feestzaal", sortOrder: 2, vendorId: vendorBloemist.id },
      { draaiboekId: draaiboek.id, startTime: "12:00", duration: 30, title: "Huwelijksinzegening", location: "Kapel Kasteel", sortOrder: 3, vendorId: null },
      { draaiboekId: draaiboek.id, startTime: "12:30", duration: 60, title: "Receptie & welkomstdrankje", location: "Terras Kasteel", sortOrder: 4, vendorId: vendorCatering.id },
      { draaiboekId: draaiboek.id, startTime: "14:00", duration: 15, title: "Fotosessie buiten", location: "Kasteeltuin", sortOrder: 5, vendorId: null },
      { draaiboekId: draaiboek.id, startTime: "17:00", duration: 120, title: "Diner", location: "Feestzaal", sortOrder: 6, vendorId: vendorCatering.id },
      { draaiboekId: draaiboek.id, startTime: "19:30", duration: 30, title: "Speeches & taart aansnijden", location: "Feestzaal", sortOrder: 7, vendorId: null },
      { draaiboekId: draaiboek.id, startTime: "20:00", duration: 300, title: "Avondfeest & DJ", location: "Feestzaal", sortOrder: 8, vendorId: vendorDJ.id },
      { draaiboekId: draaiboek.id, startTime: "01:00", duration: 30, title: "Afsluiting & vertrek gasten", location: "Entree Kasteel", sortOrder: 9, vendorId: null },
    ],
  });

  // Message threads
  const internalThread = await prisma.messageThread.upsert({
    where: { id: "thread-internal-01" },
    update: {},
    create: { id: "thread-internal-01", weddingId: wedding.id, type: "internal", subject: "Team overleg" },
  });

  const coupleThread = await prisma.messageThread.upsert({
    where: { id: "thread-couple-01" },
    update: {},
    create: { id: "thread-couple-01", weddingId: wedding.id, type: "couple", subject: "Communicatie met bruidspaar" },
  });

  await prisma.message.deleteMany({ where: { threadId: { in: [internalThread.id, coupleThread.id] } } });
  await prisma.message.createMany({
    data: [
      { threadId: internalThread.id, senderId: planner.id, content: "Catering heeft de offerte gestuurd, ik ga deze vandaag nog reviewen." },
      { threadId: coupleThread.id, senderId: planner.id, content: "Goedemorgen Emma & Thomas! De locatie is definitief geboekt 🎉" },
      { threadId: coupleThread.id, senderId: couple1.id, content: "Geweldig, dank je Sophie! We zijn zo blij 😊 Wanneer kunnen we de tafeldecoratie bespreken?" },
    ],
  });

  console.log("✅ Seed data aangemaakt!");
  console.log(`   Wedding: ${wedding.weddingCode} - ${wedding.title}`);
  console.log(`   Gebruikers: ${[admin, planner, couple1, couple2, bloemist, dj, catering].map((u) => u.name).join(", ")}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
