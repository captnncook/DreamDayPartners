// Hulpjes voor meerdaagse bruiloften: dagenlijst en nette bereik-weergave.

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last && days.length < 14) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// "11–13 september 2026" / "30 sep – 2 okt 2026" / "12 september 2026"
export function formatDateRange(start: Date, end?: Date | null, lang: string = "nl-NL"): string {
  const full = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
  if (!end || sameDay(start, end)) return full.format(start);

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    const monthYear = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(start);
    return `${start.getDate()}–${end.getDate()} ${monthYear}`;
  }
  const short = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" });
  return `${short.format(start)} – ${full.format(end)}`;
}
