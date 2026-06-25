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
    update: { city: "Utrecht", latitude: 52.0907, longitude: 5.1214, priceFrom: 750, isPremium: true, description: "Sfeervolle bruidsboeketten en complete bloemstyling voor jullie dag." },
    create: { id: "vendor-bloemist-01", name: "Bloemenwinkel Roos", category: "bloemist", contactPerson: "Roos Janssen", email: "bloemen@roos.nl", phone: "06-12345678", userId: bloemist.id, city: "Utrecht", latitude: 52.0907, longitude: 5.1214, priceFrom: 750, isPremium: true, description: "Sfeervolle bruidsboeketten en complete bloemstyling voor jullie dag." },
  });
  const vendorDJ = await prisma.vendor.upsert({
    where: { id: "vendor-dj-01" },
    update: { city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, priceFrom: 950, description: "Ervaren bruiloft-DJ met eigen geluids- en lichtinstallatie." },
    create: { id: "vendor-dj-01", name: "DJ Marco Productions", category: "dj", contactPerson: "Marco Pietersen", email: "dj@beats.nl", phone: "06-87654321", userId: dj.id, city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, priceFrom: 950, description: "Ervaren bruiloft-DJ met eigen geluids- en lichtinstallatie." },
  });
  const vendorCatering = await prisma.vendor.upsert({
    where: { id: "vendor-catering-01" },
    update: { city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, priceFrom: 45, isPremium: true, description: "Verfijnde catering op maat, van diner tot walking dinner." },
    create: { id: "vendor-catering-01", name: "Tasty Events Catering", category: "catering", contactPerson: "Maria Smit", email: "info@tasty.nl", phone: "020-9876543", userId: catering.id, city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, priceFrom: 45, isPremium: true, description: "Verfijnde catering op maat, van diner tot walking dinner." },
  });

  // Extra catalogus-leveranciers met locatie zodat de kaart gevuld is
  const extraVendors: { id: string; name: string; category: string; contactPerson: string; email: string; phone: string; city: string; latitude: number; longitude: number; priceFrom: number; isPremium: boolean; description: string }[] = [
    { id: "vendor-fotograaf-01", name: "Lichtvang Fotografie", category: "fotograaf", contactPerson: "Lara Vermeer", email: "hallo@lichtvang.nl", phone: "06-23456789", city: "Haarlem", latitude: 52.3874, longitude: 4.6462, priceFrom: 1450, isPremium: true, description: "Documentaire trouwfotografie met oog voor de kleine momenten." },
    { id: "vendor-videograaf-01", name: "Studio Eeuwig", category: "videograaf", contactPerson: "Tom de Wit", email: "info@studioeeuwig.nl", phone: "06-34567890", city: "Rotterdam", latitude: 51.9244, longitude: 4.4777, priceFrom: 1650, isPremium: false, description: "Cinematische trouwfilms die jullie verhaal vertellen." },
    { id: "vendor-locatie-01", name: "Kasteel de Haar Events", category: "trouwlocatie", contactPerson: "Eveline Boschma", email: "events@dehaar.nl", phone: "030-1234567", city: "Haarzuilens", latitude: 52.1153, longitude: 4.9869, priceFrom: 4500, isPremium: true, description: "Sprookjesachtige kasteellocatie voor een onvergetelijke bruiloft." },
    { id: "vendor-bakker-01", name: "Zoet & Zo Taarten", category: "bakker", contactPerson: "Sanne Bakker", email: "sanne@zoetenzo.nl", phone: "06-45678901", city: "Utrecht", latitude: 52.0907, longitude: 5.1214, priceFrom: 220, isPremium: false, description: "Ambachtelijke bruidstaarten, volledig naar jullie smaak." },
    { id: "vendor-haar-01", name: "Glow Bridal Studio", category: "haarstylist", contactPerson: "Noa Pieters", email: "studio@glowbridal.nl", phone: "06-56789012", city: "Amsterdam", latitude: 52.3676, longitude: 4.9041, priceFrom: 295, isPremium: false, description: "Bruidskapsels en make-up die de hele dag perfect blijven." },
    { id: "vendor-band-01", name: "The Velvet Notes", category: "liveband", contactPerson: "Daan Kroon", email: "boekingen@velvetnotes.nl", phone: "06-67890123", city: "Den Haag", latitude: 52.0705, longitude: 4.3007, priceFrom: 2200, isPremium: true, description: "Energieke liveband die elke dansvloer vult." },
    { id: "vendor-vervoer-01", name: "Classic Wedding Cars", category: "vervoer", contactPerson: "Henk Visser", email: "rijden@classiccars.nl", phone: "06-78901234", city: "Rotterdam", latitude: 51.9244, longitude: 4.4777, priceFrom: 350, isPremium: false, description: "Stijlvol vervoer met klassieke trouwauto's en chauffeur." },
    { id: "vendor-planner-01", name: "Forever Yours Weddings", category: "weddingplanner", contactPerson: "Isa Mulder", email: "hallo@foreveryours.nl", phone: "06-89012345", city: "Utrecht", latitude: 52.0907, longitude: 5.1214, priceFrom: 1800, isPremium: true, description: "Volledige weddingplanning, van eerste idee tot laatste dans." },
  ];
  for (const v of extraVendors) {
    await prisma.vendor.upsert({ where: { id: v.id }, update: { city: v.city, latitude: v.latitude, longitude: v.longitude, priceFrom: v.priceFrom, isPremium: v.isPremium, description: v.description }, create: v });
  }

  // Link vendors
  for (const [vendorId, status, notes] of [
    [vendorBloemist.id, "booked", "Bruidsboeket wit/roze, 12 tafeldecoraties"],
    [vendorDJ.id, "confirmed", "Avondfeest 20:00-01:00, eigen geluidsinstallatie"],
    [vendorCatering.id, "quote_received", "Diner voor 80 personen, 3 gangen"],
  ] as [string, string, string][]) {
    await prisma.weddingVendor.upsert({
      where: { weddingId_vendorId: { weddingId: wedding.id, vendorId } },
      update: {},
      create: { weddingId: wedding.id, vendorId, status, portalAccess: true, notes },
    });
  }

  // Budget
  const budget = await prisma.budget.upsert({
    where: { weddingId: wedding.id },
    update: {},
    create: { weddingId: wedding.id, totalAmount: 25000, currency: "EUR" },
  });

  const budgetItems = [
    { category: "Locatie", description: "Kasteel de Haar zaalverhuur", estimated: 6000, actual: 6000, payStatus: "paid", vendorId: null },
    { category: "Catering", description: "Diner & dranken 80 personen", estimated: 8000, actual: 0, payStatus: "pending", vendorId: vendorCatering.id },
    { category: "Bloemen", description: "Bruidsboeket & decoratie", estimated: 2500, actual: 2500, payStatus: "deposit_paid", vendorId: vendorBloemist.id },
    { category: "Muziek", description: "DJ avondfeest", estimated: 1500, actual: 0, payStatus: "pending", vendorId: vendorDJ.id },
    { category: "Fotografie", description: "Huwelijksfotograaf", estimated: 3000, actual: 0, payStatus: "pending", vendorId: null },
    { category: "Kleding", description: "Bruidsjurk & pak", estimated: 2500, actual: 1800, payStatus: "paid", vendorId: null },
    { category: "Diversen", description: "Uitnodigingen, bedankjes etc.", estimated: 500, actual: 320, payStatus: "paid", vendorId: null },
  ];
  for (const item of budgetItems) {
    await prisma.budgetItem.create({ data: { budgetId: budget.id, ...item } }).catch(() => {});
  }

  // Tasks
  const tasks = [
    { title: "Locatie definitief boeken", category: "venue", dueDate: new Date("2026-01-15"), status: "done", priority: "high", assignedTo: planner.id },
    { title: "Catering offerte vergelijken", category: "catering", dueDate: new Date("2026-02-01"), status: "done", priority: "high", assignedTo: planner.id },
    { title: "Uitnodigingen versturen", category: "general", dueDate: new Date("2026-03-01"), status: "done", priority: "medium", assignedTo: couple1.id },
    { title: "Menu definitief bevestigen bij catering", category: "catering", dueDate: new Date("2026-07-01"), status: "open", priority: "high", assignedTo: planner.id },
    { title: "Draaiboek finaliseren", category: "general", dueDate: new Date("2026-08-15"), status: "in_progress", priority: "high", assignedTo: planner.id },
    { title: "Zitplaatsindeling maken", category: "general", dueDate: new Date("2026-08-01"), status: "open", priority: "medium", assignedTo: couple1.id },
    { title: "DJ playlist doorgeven", category: "general", dueDate: new Date("2026-09-01"), status: "open", priority: "medium", assignedTo: couple2.id },
    { title: "Bloemen finale bespreking", category: "decoration", dueDate: new Date("2026-07-15"), status: "open", priority: "medium", assignedTo: planner.id },
  ];
  for (const task of tasks) {
    await prisma.task.create({ data: { weddingId: wedding.id, ...task } }).catch(() => {});
  }

  // Guests
  const guests = [
    { name: "Jan de Vries", email: "jan@example.nl", side: "bride", rsvpStatus: "confirmed" },
    { name: "Ria de Vries", email: "ria@example.nl", side: "bride", rsvpStatus: "confirmed", dietary: "vegetarisch" },
    { name: "Piet Bakker", email: "piet@example.nl", side: "groom", rsvpStatus: "confirmed" },
    { name: "Els Bakker", email: "els@example.nl", side: "groom", rsvpStatus: "confirmed" },
    { name: "Sanne Willems", email: "sanne@example.nl", side: "both", rsvpStatus: "confirmed" },
    { name: "Kevin Smits", email: "kevin@example.nl", side: "both", rsvpStatus: "declined" },
    { name: "Laura Hendriks", email: "laura@example.nl", side: "bride", rsvpStatus: "no_response" },
    { name: "Mark Jansen", email: "mark@example.nl", side: "groom", rsvpStatus: "confirmed", dietary: "glutenvrij" },
    { name: "Anita Visser", email: "anita@example.nl", side: "both", rsvpStatus: "invited" },
    { name: "Rob Peters", email: "rob@example.nl", side: "groom", rsvpStatus: "confirmed" },
  ];
  for (const guest of guests) {
    await prisma.guest.create({ data: { weddingId: wedding.id, ...guest } }).catch(() => {});
  }

  // Draaiboek
  const draaiboek = await prisma.draaiboek.upsert({
    where: { id: "draaiboek-demo-01" },
    update: {},
    create: { id: "draaiboek-demo-01", weddingId: wedding.id, title: "Draaiboek Trouwdag 12 september 2026", version: "1.2", status: "draft" },
  });

  const draaiboekItems = [
    { startTime: "10:00", duration: 60, title: "Bruidsopkomst & voorbereiding", location: "Bruidskamer Kasteel", sortOrder: 1, vendorId: null },
    { startTime: "11:00", duration: 30, title: "Bloemiste arriveert voor decoratie", location: "Feestzaal", sortOrder: 2, vendorId: vendorBloemist.id },
    { startTime: "12:00", duration: 30, title: "Huwelijksinzegening", location: "Kapel Kasteel", sortOrder: 3, vendorId: null },
    { startTime: "12:30", duration: 60, title: "Receptie & welkomstdrankje", location: "Terras Kasteel", sortOrder: 4, vendorId: vendorCatering.id },
    { startTime: "14:00", duration: 15, title: "Fotosessie buiten", location: "Kasteeltuin", sortOrder: 5, vendorId: null },
    { startTime: "17:00", duration: 120, title: "Diner", location: "Feestzaal", sortOrder: 6, vendorId: vendorCatering.id },
    { startTime: "19:30", duration: 30, title: "Speeches & taart aansnijden", location: "Feestzaal", sortOrder: 7, vendorId: null },
    { startTime: "20:00", duration: 300, title: "Avondfeest & DJ", location: "Feestzaal", sortOrder: 8, vendorId: vendorDJ.id },
    { startTime: "01:00", duration: 30, title: "Afsluiting & vertrek gasten", location: "Entree Kasteel", sortOrder: 9, vendorId: null },
  ];
  for (const item of draaiboekItems) {
    await prisma.draaiboekItem.create({ data: { draaiboekId: draaiboek.id, ...item } }).catch(() => {});
  }

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

  await prisma.message.create({ data: { threadId: internalThread.id, senderId: planner.id, content: "Catering heeft de offerte gestuurd, ik ga deze vandaag nog reviewen." } }).catch(() => {});
  await prisma.message.create({ data: { threadId: coupleThread.id, senderId: planner.id, content: "Goedemorgen Emma & Thomas! De locatie is definitief geboekt 🎉" } }).catch(() => {});
  await prisma.message.create({ data: { threadId: coupleThread.id, senderId: couple1.id, content: "Geweldig, dank je Sophie! We zijn zo blij 😊 Wanneer kunnen we de tafeldecoratie bespreken?" } }).catch(() => {});

  console.log("✅ Seed data aangemaakt!");
  console.log(`   Wedding: ${wedding.weddingCode} - ${wedding.title}`);
  console.log(`   Gebruikers: ${[admin, planner, couple1, couple2, bloemist, dj, catering].map((u) => u.name).join(", ")}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
