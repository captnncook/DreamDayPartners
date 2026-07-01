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
  const audienceId =
    opts.role === "vendor" ? AUDIENCE_VENDOR :
    opts.role === "couple" ? AUDIENCE_COUPLE :
    AUDIENCE_COUPLE;

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

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function emailLayout(opts: {
  heading: string;
  body: string;
  cta?: { label: string; url: string; danger?: boolean };
  footnote?: string;
}): string {
  const ctaColor = opts.cta?.danger ? "#dc2626" : "#C49A6E";
  const ctaHtml = opts.cta
    ? `
      <div style="text-align:center;margin:32px 0 24px;">
        <a href="${opts.cta.url}"
           style="display:inline-block;padding:14px 28px;background:${ctaColor};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.01em;">
          ${opts.cta.label}
        </a>
      </div>`
    : "";

  const footnoteHtml = opts.footnote
    ? `<p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">${opts.footnote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ee;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <span style="font-size:20px;font-weight:700;letter-spacing:0.05em;color:#5a4a3a;">DreamDay <span style="color:#C49A6E;">Partners</span></span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;padding:40px 40px 36px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.25;">${opts.heading}</h1>
          <div style="font-size:15px;color:#4b5563;line-height:1.7;">${opts.body}</div>
          ${ctaHtml}
          ${footnoteHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} DreamDay Partners &nbsp;·&nbsp;
          <a href="mailto:info@dreamdaypartners.com" style="color:#9ca3af;text-decoration:underline;">info@dreamdaypartners.com</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function verificationCodeEmail(code: string): { subject: string; html: string } {
  return {
    subject: `Je verificatiecode: ${code}`,
    html: emailLayout({
      heading: "Bevestig je e-mailadres",
      body: `
        <p style="margin:0 0 8px;">Gebruik de onderstaande code om je e-mailadres te bevestigen.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:0.35em;text-align:center;padding:24px 16px;background:#f4f1ee;border-radius:10px;margin:20px 0;color:#1a1a1a;">${code}</div>
        <p style="margin:0;">De code is <strong>10 minuten</strong> geldig.</p>
      `,
      footnote: "Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
    }),
  };
}

export function claimRequestAdminEmail(vendorName: string, claimantEmail: string): { subject: string; html: string } {
  return {
    subject: `Nieuwe profiel-claim aanvraag: ${vendorName}`,
    html: emailLayout({
      heading: "Nieuwe profiel-claim",
      body: `
        <p style="margin:0 0 12px;">Er is een aanvraag binnengekomen om het profiel van <strong>${vendorName}</strong> te claimen.</p>
        <p style="margin:0;"><strong>E-mailadres aanvrager:</strong> ${claimantEmail}</p>
      `,
      footnote: "Beoordeel deze aanvraag in het admin-paneel onder &ldquo;Profiel-claims&rdquo;.",
    }),
  };
}

export function claimApprovedEmail(vendorName: string, verifyUrl: string): { subject: string; html: string } {
  return {
    subject: `Je aanvraag voor "${vendorName}" is goedgekeurd`,
    html: emailLayout({
      heading: "Aanvraag goedgekeurd",
      body: `
        <p style="margin:0 0 12px;">Goed nieuws! Je aanvraag om het profiel van <strong>${vendorName}</strong> te claimen is goedgekeurd.</p>
        <p style="margin:0;">Klik op de knop hieronder om je account in te stellen. De link is <strong>48 uur</strong> geldig en eenmalig te gebruiken.</p>
      `,
      cta: { label: "Account instellen", url: verifyUrl },
      footnote: `Werkt de knop niet? Kopieer deze link: <a href="${verifyUrl}" style="color:#C49A6E;word-break:break-all;">${verifyUrl}</a>`,
    }),
  };
}

export function newDirectMessageEmail(senderName: string, preview: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: `Nieuw bericht van ${senderName}`,
    html: emailLayout({
      heading: `Nieuw bericht`,
      body: `
        <p style="margin:0 0 16px;"><strong>${senderName}</strong> heeft je een bericht gestuurd:</p>
        <blockquote style="margin:0;padding:14px 18px;background:#f4f1ee;border-left:3px solid #C49A6E;border-radius:6px;color:#4b5563;font-style:italic;">${preview}</blockquote>
      `,
      cta: { label: "Bericht bekijken", url: `${appUrl}/dm` },
    }),
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
  const benefitList = benefits
    .map(b => `<li style="margin:6px 0;padding-left:4px;">✓&nbsp; ${b}</li>`)
    .join("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    subject: "Gefeliciteerd — je hebt nu Premium toegang op DreamDay Partners!",
    html: emailLayout({
      heading: "Welkom bij Premium",
      body: `
        <p style="margin:0 0 20px;">Hallo ${name}, je profiel is zojuist opgewaardeerd naar <strong>Premium</strong>. Dit zijn je voordelen:</p>
        <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:1.8;">${benefitList}</ul>
      `,
      cta: { label: "Bekijk je premium profiel", url: `${appUrl}/leveranciers/mijn-profiel` },
      footnote: "Vragen? Stuur een e-mail naar <a href=\"mailto:info@dreamdaypartners.com\" style=\"color:#C49A6E;\">info@dreamdaypartners.com</a>",
    }),
  };
}

export function newTaskEmail(taskTitle: string, weddingTitle: string, appUrl: string): { subject: string; html: string } {
  return {
    subject: `Nieuwe taak: ${taskTitle}`,
    html: emailLayout({
      heading: "Nieuwe taak toegewezen",
      body: `
        <p style="margin:0 0 8px;">Er is een nieuwe taak aan jou toegewezen voor <strong>${weddingTitle}</strong>:</p>
        <p style="margin:0;font-size:17px;font-weight:600;color:#1a1a1a;">${taskTitle}</p>
      `,
      cta: { label: "Taak bekijken", url: `${appUrl}/tasks` },
    }),
  };
}

export function claimWelcomeEmail(vendorName: string): { subject: string; html: string } {
  return {
    subject: `Welkom op DreamDay Partners, ${vendorName}!`,
    html: emailLayout({
      heading: `Welkom, ${vendorName}!`,
      body: `
        <p style="margin:0 0 12px;">Je account is actief. Via het dashboard kun je bruidsparen bereiken, je profiel aanvullen en aanvragen beheren.</p>
        <p style="margin:0;">Veel succes!</p>
      `,
    }),
  };
}

// ---------------------------------------------------------------------------
// Standalone helpers used directly in API routes
// ---------------------------------------------------------------------------

export function accountActivationEmail(name: string, activateUrl: string): { subject: string; html: string } {
  return {
    subject: "Je account op DreamDay Partners is aangemaakt",
    html: emailLayout({
      heading: "Account activeren",
      body: `
        <p style="margin:0 0 12px;">Welkom op DreamDay Partners${name ? `, ${name}` : ""}!</p>
        <p style="margin:0;">Er is een account voor je aangemaakt. Klik op de knop om je wachtwoord in te stellen en in te loggen. De link is <strong>7 dagen</strong> geldig.</p>
      `,
      cta: { label: "Account activeren", url: activateUrl },
      footnote: `Werkt de knop niet? Kopieer deze link: <a href="${activateUrl}" style="color:#C49A6E;word-break:break-all;">${activateUrl}</a>`,
    }),
  };
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Wachtwoord opnieuw instellen",
    html: emailLayout({
      heading: "Nieuw wachtwoord instellen",
      body: `
        <p style="margin:0 0 12px;">Je hebt gevraagd om je wachtwoord opnieuw in te stellen voor DreamDay Partners.</p>
        <p style="margin:0;">Klik op de knop hieronder om een nieuw wachtwoord te kiezen. De link is <strong>1 uur</strong> geldig.</p>
      `,
      cta: { label: "Nieuw wachtwoord instellen", url: resetUrl },
      footnote: `Werkt de knop niet? Kopieer deze link: <a href="${resetUrl}" style="color:#C49A6E;word-break:break-all;">${resetUrl}</a><br>Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.`,
    }),
  };
}

export function adminPasswordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Stel je wachtwoord in voor DreamDay Partners",
    html: emailLayout({
      heading: "Wachtwoord instellen",
      body: `
        <p style="margin:0 0 12px;">Je ontvangt deze e-mail omdat een beheerder een wachtwoordreset heeft aangevraagd voor jouw account.</p>
        <p style="margin:0;">Klik op de knop hieronder om een (nieuw) wachtwoord in te stellen. De link is <strong>1 uur</strong> geldig.</p>
      `,
      cta: { label: "Wachtwoord instellen", url: resetUrl },
      footnote: `Werkt de knop niet? Kopieer deze link: <a href="${resetUrl}" style="color:#C49A6E;word-break:break-all;">${resetUrl}</a>`,
    }),
  };
}

export function deleteRequestEmail(vendorName: string, confirmUrl: string): { subject: string; html: string } {
  return {
    subject: "Bevestig verwijdering van je profiel",
    html: emailLayout({
      heading: "Profiel verwijderen",
      body: `
        <p style="margin:0 0 12px;">Hallo ${vendorName}, je hebt gevraagd om je profiel op DreamDay Partners te verwijderen.</p>
        <p style="margin:0;">Klik op de knop hieronder om de verwijdering te bevestigen. De link is <strong>24 uur</strong> geldig. <strong>Deze actie kan niet ongedaan worden gemaakt.</strong></p>
      `,
      cta: { label: "Profiel definitief verwijderen", url: confirmUrl, danger: true },
      footnote: `Werkt de knop niet? Kopieer deze link: <a href="${confirmUrl}" style="color:#C49A6E;word-break:break-all;">${confirmUrl}</a><br>Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.`,
    }),
  };
}

export function deleteAdminNotificationEmail(vendorName: string, userEmail: string): { subject: string; html: string } {
  return {
    subject: `Leveranciersprofiel verwijderd: ${vendorName}`,
    html: emailLayout({
      heading: "Profiel verwijderd",
      body: `
        <p style="margin:0 0 16px;">Het leveranciersprofiel van <strong>${vendorName}</strong> is definitief verwijderd.</p>
        <table style="border-collapse:collapse;font-size:14px;width:100%;">
          <tr><td style="padding:6px 12px 6px 0;color:#9ca3af;">E-mailadres</td><td style="padding:6px 0;">${userEmail}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#9ca3af;">Tijdstip</td><td style="padding:6px 0;">${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}</td></tr>
        </table>
      `,
    }),
  };
}
