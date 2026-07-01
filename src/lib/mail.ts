import { Resend } from "resend";

const FROM = process.env.MAIL_FROM ?? "DreamDay Platform <onboarding@resend.dev>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const AUDIENCE_COUPLE = process.env.RESEND_AUDIENCE_COUPLE ?? "";
const AUDIENCE_VENDOR = process.env.RESEND_AUDIENCE_VENDOR ?? "";

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  name?: string;
  role?: "couple" | "vendor" | "planner" | "team_member" | "admin";
}): Promise<void> {
  if (!resend) {
    console.log(`[mail:skipped — no RESEND_API_KEY] to=${opts.to} subject="${opts.subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
  } catch (err) {
    console.error("Mail send failed:", err);
  }
  // Save to the correct Resend audience based on role
  const audienceId =
    opts.role === "vendor" ? AUDIENCE_VENDOR :
    opts.role === "couple" ? AUDIENCE_COUPLE :
    AUDIENCE_COUPLE; // default to couple audience for unknown roles

  if (audienceId) {
    try {
      await resend.contacts.create({
        audienceId,
        email: opts.to,
        ...(opts.name ? { firstName: opts.name } : {}),
        unsubscribed: false,
      });
    } catch {
      // Contact may already exist — ignore
    }
  }
}

export function verificationCodeEmail(code: string): { subject: string; html: string } {
  return {
    subject: `Je verificatiecode: ${code}`,
    html: `
      <p>Gebruik onderstaande code om je e-mailadres te bevestigen voor DreamDay Partners.</p>
      <div style="font-size:2.5rem;font-weight:bold;letter-spacing:0.4em;text-align:center;padding:1.5rem;background:#f8f5f0;border-radius:12px;margin:1.5rem 0;color:#333;">${code}</div>
      <p style="color:#888;font-size:0.9em;">Deze code is <strong>10 minuten</strong> geldig. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.</p>
    `,
  };
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

export function newDirectMessageEmail(senderName: string, preview: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: `Nieuw bericht van ${senderName}`,
    html: `
      <p><strong>${senderName}</strong> heeft je een bericht gestuurd op DreamDay Platform:</p>
      <blockquote style="border-left:3px solid #c49a6c;margin:0;padding:0.5rem 1rem;color:#555;">${preview}</blockquote>
      <p><a href="${appUrl}/dm" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;">Bericht bekijken</a></p>
    `,
  };
}

const PREMIUM_BENEFITS: Record<string, string[]> = {
  fotograaf:       ["Uitgelicht profiel bovenaan zoekresultaten", "Onbeperkte fotogalerij", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  videograaf:      ["Uitgelicht profiel bovenaan zoekresultaten", "Onbeperkte fotogalerij", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  bloemist:        ["Uitgelicht profiel bovenaan zoekresultaten", "Uitgebreide specialisaties tonen", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  catering:        ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  dj:              ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  liveband:        ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  trouwlocatie:    ["Uitgelicht profiel bovenaan zoekresultaten", "Kaartweergave met prominente pin", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  weddingplanner:  ["Uitgelicht profiel bovenaan zoekresultaten", "Onbeperkt bruiloften beheren", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
  default:         ["Uitgelicht profiel bovenaan zoekresultaten", "Directe aanvraagknop voor bruidsparen", "Beschikbaarheidskalender zichtbaar", "Statistieken & profielbezoeken"],
};

export function premiumGrantedEmail(name: string, vendorType: string | null): { subject: string; html: string } {
  const benefits = PREMIUM_BENEFITS[vendorType ?? ""] ?? PREMIUM_BENEFITS.default;
  const benefitList = benefits.map(b => `<li style="margin:0.4rem 0;">✓ ${b}</li>`).join("");
  return {
    subject: "Gefeliciteerd — je hebt nu Premium toegang op DreamDay Partners!",
    html: `
      <p>Hallo ${name},</p>
      <p>Goed nieuws! Je profiel op DreamDay Partners is zojuist opgewaardeerd naar <strong>Premium</strong>.</p>
      <p style="font-weight:600;margin-top:1.5rem;">Wat premium voor jou betekent:</p>
      <ul style="padding-left:1rem;color:#333;">${benefitList}</ul>
      <p style="margin-top:1.5rem;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/leveranciers/mijn-profiel"
           style="display:inline-block;padding:12px 24px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Bekijk je premium profiel
        </a>
      </p>
      <p style="color:#888;font-size:0.9em;margin-top:1rem;">Vragen? Stuur een e-mail naar info@dreamdayplatform.com</p>
    `,
  };
}

export function newTaskEmail(taskTitle: string, weddingTitle: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: `Nieuwe taak: ${taskTitle}`,
    html: `
      <p>Er is een nieuwe taak aan jou toegewezen voor <strong>${weddingTitle}</strong>:</p>
      <p style="font-size:1.1em;font-weight:bold;">${taskTitle}</p>
      <p><a href="${appUrl}/tasks" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#c49a6c;color:#fff;border-radius:8px;text-decoration:none;">Taak bekijken</a></p>
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
