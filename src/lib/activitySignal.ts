import { prisma } from "@/lib/prisma";

export type ActivityKind = "register" | "rsvp" | "vendor_contact" | "login_failed";

// Pure zichtbaarheid, geen handhaving: dit blokkeert of vertraagt nooit een
// verzoek. Het legt alleen vast dát iets gebeurde (welk type actie, vanaf
// welk IP, met welk e-mailadres) zodat een admin achteraf ongewone pieken
// kan zien — nieuwsgierige eenmalige bezoekers vallen hier nooit onder op,
// pas herhaling/volume maakt iets zichtbaar als patroon.
export async function logActivitySignal(kind: ActivityKind, ip: string | null, email?: string | null): Promise<void> {
  try {
    await prisma.activitySignal.create({
      data: { kind, ip: ip ?? null, email: email?.toLowerCase() ?? null },
    });
  } catch (err) {
    console.error("[activitySignal] failed to log:", err);
  }
}

// Next.js zet het echte client-IP niet standaard op req.ip; achter Railway's
// proxy staat het in x-forwarded-for (eerste waarde in de lijst).
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}
