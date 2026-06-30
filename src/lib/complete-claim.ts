import { prisma } from "./prisma";
import { setSession } from "./session";
import { sendMail, claimWelcomeEmail } from "./mail";

const MAX_ATTEMPTS = 10;

/** Links an OAuth-authenticated email to the vendor behind an approved claim token. */
export async function completeClaimViaOAuth(claimToken: string, email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const request = await prisma.vendorClaimRequest.findUnique({ where: { token: claimToken }, include: { vendor: true } });
  if (!request || request.status !== "approved") return { ok: false, error: "Ongeldige of verlopen link" };
  if (request.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Te veel pogingen" };
  if (!request.tokenExpiresAt || request.tokenExpiresAt < new Date()) return { ok: false, error: "Link verlopen" };

  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail !== request.email.toLowerCase()) {
    await prisma.vendorClaimRequest.update({ where: { id: request.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "E-mailadres komt niet overeen met de aanvraag" };
  }

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: request.vendor.contactPerson || request.vendor.name,
        role: "vendor",
        vendorType: request.vendor.category,
      },
    });
  }

  await prisma.$transaction([
    prisma.vendor.update({ where: { id: request.vendorId }, data: { userId: user.id, email: normalizedEmail } }),
    prisma.vendorClaimRequest.update({ where: { id: request.id }, data: { status: "completed", token: null } }),
  ]);

  await setSession(user.id);

  const welcome = claimWelcomeEmail(request.vendor.name);
  await sendMail({ to: normalizedEmail, subject: welcome.subject, html: welcome.html });

  return { ok: true };
}
