import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

const DEMO_DEFAULTS: Record<string, { name: string; role: string; vendorType?: string }> = {
  "admin@dreamday.nl":   { name: "Platform Admin",         role: "admin" },
  "planner@dreamday.nl": { name: "Sophie van der Berg",    role: "planner" },
  "emma@example.nl":     { name: "Emma de Vries",          role: "couple" },
  "thomas@example.nl":   { name: "Thomas Bakker",          role: "couple" },
  "bloemen@roos.nl":     { name: "Roos Janssen",           role: "vendor", vendorType: "bloemist" },
  "dj@beats.nl":         { name: "DJ Marco",               role: "vendor", vendorType: "dj" },
  "info@tasty.nl":       { name: "Tasty Events Catering",  role: "vendor", vendorType: "catering" },
};

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email verplicht" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const defaults = DEMO_DEFAULTS[email];
    if (!defaults) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }
    user = await prisma.user.create({
      data: { email, name: defaults.name, role: defaults.role, vendorType: defaults.vendorType ?? null, isPremium: defaults.role !== "couple" },
    });
  }

  await setSession(user.id);
  return NextResponse.json({ user });
}
