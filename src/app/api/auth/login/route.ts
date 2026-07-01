import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { compare } from "bcryptjs";

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
  const body = await req.json();
  const { email, password } = body as { email: string; password?: string };

  if (!email) {
    return NextResponse.json({ error: "Email verplicht" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email } });

  // Real account with password
  if (user && user.passwordHash) {
    if (!password) {
      return NextResponse.json({ error: "Wachtwoord verplicht" }, { status: 400 });
    }
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
    }
    await setSession(user.id);
    return NextResponse.json({ user });
  }

  // Demo login (no password required)
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
