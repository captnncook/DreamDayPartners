import { Resend } from "resend";
import { translations, type Lang } from "@/lib/i18n";

// Simpele "{key}"-interpolatie voor e-mailcopy — de vertaalstrings in
// i18n.ts bevatten placeholders zoals {vendorName} die hier worden ingevuld.
function fmt(str: string, vars: Record<string, string> = {}): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

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

// Lettergroottes hier zijn hardcoded px (Outlook ondersteunt geen CSS
// var()), maar bewust gekozen op dezelfde stappen als de --text-* schaal
// in globals.css (12=sm, 13=base, 14=md, 15=lg, 17=2xl, 20=3xl, 24=5xl) —
// zo blijft e-mail en site visueel consistent zonder dat de token hier
// letterlijk herbruikt kan worden.
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
          © ${new Date().getFullYear()} DreamDay Platform &nbsp;·&nbsp;
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

export function verificationCodeEmail(code: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.verificationCode;
  return {
    subject: fmt(t.subject, { code }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 8px;">${t.intro}</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:0.35em;text-align:center;padding:24px 16px;background:#f4f1ee;border-radius:10px;margin:20px 0;color:#1a1a1a;">${code}</div>
        <p style="margin:0;">${t.validFor}</p>
      `,
      footnote: t.footnote,
    }),
  };
}

export function claimRequestAdminEmail(vendorName: string, claimantEmail: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.claimRequestAdmin;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body, { vendorName })}</p>
        <p style="margin:0;"><strong>${t.requesterLabel}</strong> ${claimantEmail}</p>
      `,
      footnote: t.footnote,
    }),
  };
}

export function claimApprovedEmail(vendorName: string, verifyUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.claimApproved;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body1, { vendorName })}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
      cta: { label: t.cta, url: verifyUrl },
      footnote: `${t.footnotePrefix} <a href="${verifyUrl}" style="color:#C49A6E;word-break:break-all;">${verifyUrl}</a>`,
    }),
  };
}

export function newDirectMessageEmail(senderName: string, preview: string, appUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.newDirectMessage;
  return {
    subject: fmt(t.subject, { senderName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 16px;">${fmt(t.body, { senderName })}</p>
        <blockquote style="margin:0;padding:14px 18px;background:#f4f1ee;border-left:3px solid #C49A6E;border-radius:6px;color:#4b5563;font-style:italic;">${preview}</blockquote>
      `,
      cta: { label: t.cta, url: `${appUrl}/dm` },
    }),
  };
}

const PREMIUM_BENEFITS: Record<Lang, Record<string, string[]>> = {
  nl: {
    fotograaf:       ["Uitgelicht profiel bovenaan zoekresultaten", "Onbeperkte fotogalerij", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    videograaf:      ["Uitgelicht profiel bovenaan zoekresultaten", "Onbeperkte fotogalerij", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    bloemist:        ["Uitgelicht profiel bovenaan zoekresultaten", "Uitgebreide specialisaties tonen", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    catering:        ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    dj:              ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    liveband:        ["Uitgelicht profiel bovenaan zoekresultaten", "Beschikbaarheidskalender zichtbaar", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    trouwlocatie:    ["Uitgelicht profiel bovenaan zoekresultaten", "Kaartweergave met prominente pin", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    weddingplanner:  ["Uitgelicht profiel bovenaan zoekresultaten", "10 tot 100+ bruiloften tegelijk beheren", "Directe aanvraagknop voor bruidsparen", "Statistieken & profielbezoeken"],
    default:         ["Uitgelicht profiel bovenaan zoekresultaten", "Directe aanvraagknop voor bruidsparen", "Beschikbaarheidskalender zichtbaar", "Statistieken & profielbezoeken"],
  },
  en: {
    fotograaf:       ["Featured profile at the top of search results", "Unlimited photo gallery", "Direct request button for couples", "Stats & profile visits"],
    videograaf:      ["Featured profile at the top of search results", "Unlimited photo gallery", "Direct request button for couples", "Stats & profile visits"],
    bloemist:        ["Featured profile at the top of search results", "Show extended specialties", "Direct request button for couples", "Stats & profile visits"],
    catering:        ["Featured profile at the top of search results", "Visible availability calendar", "Direct request button for couples", "Stats & profile visits"],
    dj:              ["Featured profile at the top of search results", "Visible availability calendar", "Direct request button for couples", "Stats & profile visits"],
    liveband:        ["Featured profile at the top of search results", "Visible availability calendar", "Direct request button for couples", "Stats & profile visits"],
    trouwlocatie:    ["Featured profile at the top of search results", "Map view with prominent pin", "Direct request button for couples", "Stats & profile visits"],
    weddingplanner:  ["Featured profile at the top of search results", "Manage 10 to 100+ weddings at once", "Direct request button for couples", "Stats & profile visits"],
    default:         ["Featured profile at the top of search results", "Direct request button for couples", "Visible availability calendar", "Stats & profile visits"],
  },
};

export function premiumGrantedEmail(name: string, vendorType: string | null, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.premiumGranted;
  const benefits = PREMIUM_BENEFITS[lang][vendorType ?? ""] ?? PREMIUM_BENEFITS[lang].default;
  const benefitList = benefits
    .map(b => `<li style="margin:6px 0;padding-left:4px;">✓&nbsp; ${b}</li>`)
    .join("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    subject: t.subject,
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 20px;">${fmt(t.body, { name })}</p>
        <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:1.8;">${benefitList}</ul>
      `,
      cta: { label: t.cta, url: `${appUrl}/leveranciers/mijn-profiel` },
      footnote: t.footnote,
    }),
  };
}

export function newTaskEmail(taskTitle: string, weddingTitle: string, appUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.newTask;
  return {
    subject: fmt(t.subject, { taskTitle }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 8px;">${fmt(t.body, { weddingTitle })}</p>
        <p style="margin:0;font-size:17px;font-weight:600;color:#1a1a1a;">${taskTitle}</p>
      `,
      cta: { label: t.cta, url: `${appUrl}/tasks` },
    }),
  };
}

export function claimWelcomeEmail(vendorName: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.claimWelcome;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: fmt(t.heading, { vendorName }),
      body: `
        <p style="margin:0 0 12px;">${t.body1}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
    }),
  };
}

// ---------------------------------------------------------------------------
// Standalone helpers used directly in API routes
// ---------------------------------------------------------------------------

export function accountActivationEmail(name: string, activateUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.accountActivation;
  return {
    subject: t.subject,
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.welcome, { namePart: name ? `, ${name}` : "" })}</p>
        <p style="margin:0;">${t.body}</p>
      `,
      cta: { label: t.cta, url: activateUrl },
      footnote: `${t.footnotePrefix} <a href="${activateUrl}" style="color:#C49A6E;word-break:break-all;">${activateUrl}</a>`,
    }),
  };
}

export function rsvpConfirmationEmail(
  weddingTitle: string, weddingDate: Date, venue: string | null, attending: boolean, guestNames: string[], lang: Lang = "nl"
): { subject: string; html: string } {
  const t = translations[lang].emails.rsvpConfirmation;
  const dateStr = new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(weddingDate);
  const names = guestNames.filter(Boolean);
  const namesList = names.map((n) => `<li style="margin:2px 0;">${n}</li>`).join("");
  return {
    subject: attending ? fmt(t.subjectAttending, { weddingTitle }) : fmt(t.subjectDeclined, { weddingTitle }),
    html: emailLayout({
      heading: attending ? t.headingAttending : t.headingDeclined,
      body: `
        <p style="margin:0 0 4px;font-weight:600;">${weddingTitle}</p>
        <p style="margin:0 0 16px;color:#6b6b6b;text-transform:capitalize;">${dateStr}${venue ? ` &middot; ${venue}` : ""}</p>
        ${attending
          ? `<p style="margin:0 0 8px;">${t.registeredIntro}</p><ul style="margin:0 0 16px;padding-left:20px;">${namesList || `<li>${names[0] ?? t.you}</li>`}</ul><p style="margin:0;">${t.registeredOutro}</p>`
          : `<p style="margin:0;">${t.declinedBody}</p>`
        }
      `,
    }),
  };
}

export function coupleWeddingInviteEmail(vendorName: string, weddingTitle: string, inviteUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.coupleWeddingInvite;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body1, { vendorName, weddingTitle })}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
      cta: { label: t.cta, url: inviteUrl },
      footnote: `${t.footnotePrefix} <a href="${inviteUrl}" style="color:#C49A6E;word-break:break-all;">${inviteUrl}</a>`,
    }),
  };
}

export function teamInviteEmail(invitedByName: string, weddingTitle: string, acceptUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.teamInvite;
  return {
    subject: fmt(t.subject, { invitedByName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body1, { invitedByName, weddingTitle })}</p>
        <p style="margin:0;">${fmt(t.body2, { invitedByName })}</p>
      `,
      cta: { label: t.cta, url: acceptUrl },
      footnote: `${t.footnotePrefix} <a href="${acceptUrl}" style="color:#C49A6E;word-break:break-all;">${acceptUrl}</a>`,
    }),
  };
}

export function passwordResetEmail(resetUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.passwordReset;
  return {
    subject: t.subject,
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${t.body1}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
      cta: { label: t.cta, url: resetUrl },
      footnote: `${t.footnotePrefix} <a href="${resetUrl}" style="color:#C49A6E;word-break:break-all;">${resetUrl}</a><br>${t.footnoteSuffix}`,
    }),
  };
}

export function adminPasswordResetEmail(resetUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.adminPasswordReset;
  return {
    subject: t.subject,
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${t.body1}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
      cta: { label: t.cta, url: resetUrl },
      footnote: `${t.footnotePrefix} <a href="${resetUrl}" style="color:#C49A6E;word-break:break-all;">${resetUrl}</a>`,
    }),
  };
}

export function deleteRequestEmail(vendorName: string, confirmUrl: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.deleteRequest;
  return {
    subject: t.subject,
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body1, { vendorName })}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
      cta: { label: t.cta, url: confirmUrl, danger: true },
      footnote: `${t.footnotePrefix} <a href="${confirmUrl}" style="color:#C49A6E;word-break:break-all;">${confirmUrl}</a><br>${t.footnoteSuffix}`,
    }),
  };
}

// Naar het bruidspaar/team van een geplande bruiloft wanneer een gekoppelde
// leverancier zijn DreamDay-account verwijdert. Boekingsdata blijft bewaard.
export function vendorLeftWeddingEmail(vendorName: string, weddingTitle: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.vendorLeftWedding;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.body1, { vendorName })}</p>
        <p style="margin:0 0 12px;">${fmt(t.body2, { weddingTitle })}</p>
        <p style="margin:0;">${t.body3}</p>
      `,
    }),
  };
}

// Naar alle gekoppelde leveranciers wanneer een bruidspaar zijn account (en
// daarmee de bruiloft) verwijdert voor de trouwdag.
export function weddingCancelledEmail(vendorName: string, weddingTitle: string, weddingDate: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.weddingCancelled;
  return {
    subject: fmt(t.subject, { weddingTitle }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 12px;">${fmt(t.greeting, { vendorName })}</p>
        <p style="margin:0 0 12px;">${fmt(t.body1, { weddingTitle, weddingDate })}</p>
        <p style="margin:0;">${t.body2}</p>
      `,
    }),
  };
}

export function deleteAdminNotificationEmail(vendorName: string, userEmail: string, lang: Lang = "nl"): { subject: string; html: string } {
  const t = translations[lang].emails.deleteAdminNotification;
  return {
    subject: fmt(t.subject, { vendorName }),
    html: emailLayout({
      heading: t.heading,
      body: `
        <p style="margin:0 0 16px;">${fmt(t.body, { vendorName })}</p>
        <table style="border-collapse:collapse;font-size:14px;width:100%;">
          <tr><td style="padding:6px 12px 6px 0;color:#9ca3af;">${t.emailLabel}</td><td style="padding:6px 0;">${userEmail}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#9ca3af;">${t.timeLabel}</td><td style="padding:6px 0;">${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}</td></tr>
        </table>
      `,
    }),
  };
}
