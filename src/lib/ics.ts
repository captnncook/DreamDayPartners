// Bouwt een RFC 5545 (.ics) agenda-feed voor een draaiboek, zodat
// Google Calendar / Apple Kalender / Outlook dit als abonnement (webcal)
// kunnen volgen. Europe/Amsterdam wordt als vaste VTIMEZONE meegegeven
// zodat CET/CEST-zomertijd correct wordt weergegeven in elke agenda-app.

export type IcsEvent = {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start: Date; // lokale tijd Europe/Amsterdam
  durationMinutes: number;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// Formatteert een datum als "floating" lokale tijd (gekoppeld aan de
// VTIMEZONE hieronder), niet als UTC — nodig omdat startTime in het
// draaiboek altijd de lokale kloktijd is.
function formatLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function formatUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

// Escaping volgens RFC 5545 §3.3.11.
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Vouwt regels langer dan 75 octets, met een voorloop-spatie op vervolgregels.
function foldLine(line: string): string {
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes <= 75) return line;
  const out: string[] = [];
  let current = line;
  let first = true;
  while (Buffer.byteLength(current, "utf8") > (first ? 75 : 74)) {
    let cut = first ? 75 : 74;
    // Voorkom dat we een multi-byte UTF-8 karakter middendoor knippen.
    while (cut > 0 && Buffer.byteLength(current.slice(0, cut), "utf8") > (first ? 75 : 74)) cut--;
    out.push((first ? "" : " ") + current.slice(0, cut));
    current = current.slice(cut);
    first = false;
  }
  out.push(" " + current);
  return out.join("\r\n");
}

const VTIMEZONE = `BEGIN:VTIMEZONE
TZID:Europe/Amsterdam
X-LIC-LOCATION:Europe/Amsterdam
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;

export function buildIcsCalendar(calendarName: string, events: IcsEvent[]): string {
  const now = new Date();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DreamDay//Draaiboek//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Amsterdam",
    VTIMEZONE,
  ];

  for (const ev of events) {
    const end = new Date(ev.start.getTime() + ev.durationMinutes * 60000);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}@dreamday.nl`);
    lines.push(`DTSTAMP:${formatUtcStamp(now)}`);
    lines.push(`DTSTART;TZID=Europe/Amsterdam:${formatLocal(ev.start)}`);
    lines.push(`DTEND;TZID=Europe/Amsterdam:${formatLocal(end)}`);
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
