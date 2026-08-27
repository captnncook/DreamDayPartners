import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "ddp_session";
const IMPERSONATE_COOKIE = "ddp_impersonate";

// Als een admin "meekijkt" als een andere gebruiker (support-modus), blijft
// de eigen sessie-cookie ongewijzigd staan (dat is nog steeds de echte
// ingelogde admin) en komt er alleen een tweede cookie bij met het
// doel-account. getSession() geeft dan het doel-account terug — maar alleen
// als de echte ingelogde gebruiker daadwerkelijk admin is, zodat het
// meekijk-cookie zelf nooit als een soort tweede wachtwoord kan dienen.
export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  try {
    const impersonateId = cookieStore.get(IMPERSONATE_COOKIE)?.value;
    if (impersonateId) {
      const admin = await prisma.user.findUnique({ where: { id: userId } });
      if (admin?.role === "admin") {
        const target = await prisma.user.findUnique({ where: { id: impersonateId } });
        if (target) return target;
      }
    }
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

// Geeft altijd de echt ingelogde gebruiker terug, ook tijdens meekijk-modus
// — nodig voor de meekijk-banner zelf en om te bepalen wie er mag stoppen.
export async function getRealSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

export async function getImpersonationStatus(): Promise<{ active: boolean; target?: User; admin?: User }> {
  const cookieStore = await cookies();
  const impersonateId = cookieStore.get(IMPERSONATE_COOKIE)?.value;
  if (!impersonateId) return { active: false };

  const adminId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!adminId) return { active: false };

  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role !== "admin") return { active: false };
    const target = await prisma.user.findUnique({ where: { id: impersonateId } });
    if (!target) return { active: false };
    return { active: true, target, admin };
  } catch {
    return { active: false };
  }
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(IMPERSONATE_COOKIE);
}

export async function startImpersonation(targetUserId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, targetUserId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 4, // 4 uur — meekijk-modus verloopt vanzelf, geen permanente sessie
    sameSite: "lax",
  });
}

export async function stopImpersonation(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE);
}
