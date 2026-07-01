import { Resend } from "resend";

const FROM = process.env.MAIL_FROM ?? "DreamDay Platform <info@dreamdayplatform.com>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    console.log(`[mail:skipped — no RESEND_API_KEY] to=${opts.to} subject="${opts.subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
  } catch (err) {
    console.error("Mail send failed:", err);
  }
}

export function claimRequestAdminEmail(vendorName: string, claimantEmail: string): { subject: string; html: string } {
  return {
    subject: `Nieuwe profiel-claim aanvraag: ${vendorName}`,
    html: `
      <p>Er is een aanvraag binnengekomen om het profiel van <strong>${vendorName}</strong> te claimen.</p>
      <p>E-mailadres aanvrager: <strong>${claimantEmail}</strong></p>
      <p>Beoordeel deze aanvraag in het admin-paneel onder "Profiel-claims".</p>
    `,
  };
}

export function claimApprovedEmail(vendorName: string, verifyUrl: string): { subject: string; html: string } {
  return {
    subject: `Je aanvraag voor "${vendorName}" is goedgekeurd`,
    html: `
      <p>Goed nieuws! Je aanvraag om het profiel van <strong>${vendorName}</strong> te claimen op DreamDay Platform is goedgekeurd.</p>
      <p>Klik op onderstaande link om je account in te stellen. Deze link is <strong>48 uur</strong> geldig en eenmalig te gebruiken.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;">Account instellen</a></p>
      <p>Werkt de knop niet? Kopieer deze link: ${verifyUrl}</p>
    `,
  };
}

export function claimWelcomeEmail(vendorName: string): { subject: string; html: string } {
  return {
    subject: `Welkom op DreamDay Platform, ${vendorName}!`,
    html: `
      <p>Je account is actief. Hier is hoe je het dashboard gebruikt om bruidsparen te bereiken, je profiel aan te vullen en aanvragen te beheren.</p>
      <p>Veel succes!</p>
    `,
  };
}
