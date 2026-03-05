import crypto from "crypto";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// iCalendar uses UTC timestamps in many clients. We'll generate UTC.
function toICSDateUTC(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function foldLine(line: string) {
  // 75 octets rule; for safety fold at ~70 chars
  const limit = 70;
  if (line.length <= limit) return line;
  let out = "";
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + limit);
    out += (i === 0 ? "" : "\r\n ") + chunk;
    i += limit;
  }
  return out;
}

function escText(s: string) {
  // RFC5545 escaping
  return s
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function createTableBookingICS(opts: {
  restaurantName: string;
  restaurantAddress?: string;
  customerName: string;
  customerEmail: string; // ✅ add
  organizerEmail: string; // ✅ add (your restaurant email)
  bookingAt: Date;
  durationMinutes?: number;
  inquiryId: string;
  notes?: string;
}) {
  const duration = opts.durationMinutes ?? 90;
  const start = opts.bookingAt;
  const end = new Date(start.getTime() + duration * 60_000);

  const uid = crypto
    .createHash("sha256")
    .update(`booking:${opts.inquiryId}:${start.toISOString()}`)
    .digest("hex")
    .slice(0, 24);

  const organizer = `ORGANIZER;CN=${escText(opts.restaurantName)}:mailto:${opts.organizerEmail}`;
  const attendee = `ATTENDEE;CN=${escText(opts.customerName)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${opts.customerEmail}`;
  const dtstamp = new Date();

  const summary = `${opts.restaurantName} • Table Booking`;
  const description = [
    `Booking confirmed for ${opts.customerName}.`,
    opts.notes ? `Notes: ${opts.notes}` : "",
    `Reference: ${opts.inquiryId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pontville//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}@pontville`,
    `DTSTAMP:${toICSDateUTC(dtstamp)}`,
    `DTSTART:${toICSDateUTC(start)}`,
    `DTEND:${toICSDateUTC(end)}`,
    foldLine(`SUMMARY:${escText(summary)}`),
    foldLine(`DESCRIPTION:${escText(description)}`),
    opts.restaurantAddress
      ? foldLine(`LOCATION:${escText(opts.restaurantAddress)}`)
      : "",
    organizer, // ✅
    attendee, // ✅
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}
