export function to12HourTime(input: string) {
  if (!input) return "";

  // Case 1: Already 12-hour format
  if (/am|pm/i.test(input)) {
    const date = new Date(`1970-01-01 ${input}`);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid time: "${input}"`);
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Case 2: HH:mm format
  const [hh, mm] = input.split(":").map(Number);

  if (
    Number.isNaN(hh) ||
    Number.isNaN(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    throw new Error(`Invalid time: "${input}" (expected "HH:mm")`);
  }

  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 || 12;

  return `${hour12}:${mm.toString().padStart(2, "0")} ${period}`;
}
import { format } from "date-fns";

/**
 * Example output:
 * Fri, 13 Feb 2026
 */
export function formatEventDateLabel(date: Date) {
  return format(date, "EEE, dd MMM yyyy");
}

/**
 * Example output:
 * 7:00 PM – 9:00 PM
 * 7:00 PM – Late
 */
export function formatEventTimeLabel(
  startsAt: Date,
  endsAt?: Date | null,
  fallback: string = "Late",
) {
  const start = format(startsAt, "h:mm a");

  if (!endsAt) {
    return `${start} – ${fallback}`;
  }

  const end = format(endsAt, "h:mm a");
  return `${start} – ${end}`;
}

export function combineDateAndTime(date: Date, timeHHmm: string) {
  const [hh, mm] = timeHHmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function getTodayRange(tz = "Australia/Hobart") {
  // Server-safe “today” range using Intl (good enough for dashboard KPIs)
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce(
      (acc, p) => {
        if (p.type !== "literal") acc[p.type] = p.value;
        return acc;
      },
      {} as Record<string, string>,
    );

  const yyyy = parts.year;
  const mm = parts.month;
  const dd = parts.day;

  // Construct a date in UTC for range boundaries by interpreting “local date”
  // If you want perfect timezone correctness, move to Temporal later.
  const start = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  const end = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

  return { start, end };
}
