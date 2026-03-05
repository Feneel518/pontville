import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/db";
import { createTableBookingICS } from "@/lib/calendar/calendar";

// If you don't have event ICS helper, this creates a simple all-day event ICS.
function createEventICS(opts: {
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  organizerEmail: string;
  inquiryId: string;
  eventType: string;
  eventDate: Date; // date only
  notes?: string;
}) {
  // all-day event DTSTART/DTEND as YYYYMMDD
  const yyyy = opts.eventDate.getFullYear();
  const mm = String(opts.eventDate.getMonth() + 1).padStart(2, "0");
  const dd = String(opts.eventDate.getDate()).padStart(2, "0");
  const dt = `${yyyy}${mm}${dd}`;

  const uid = `${opts.inquiryId}@${opts.organizerEmail.split("@")[1] ?? "booking"}`;
  const now = new Date();
  const dtstamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  const esc = (s: string) =>
    String(s ?? "")
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pontville//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${esc(`${opts.eventType} @ ${opts.restaurantName}`)}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`, // same day; clients usually render all-day
    `LOCATION:${esc(opts.restaurantAddress)}`,
    `DESCRIPTION:${esc(
      `Event inquiry accepted.\nRef: ${opts.inquiryId}\nName: ${opts.customerName}${
        opts.notes ? `\nNotes: ${opts.notes}` : ""
      }`,
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      tableInquiry: true,
      eventInquiry: true,
      restaurant: {
        select: { name: true, addressLine: true, city: true, state: true },
      },
    },
  });

  if (!inquiry || inquiry.status !== "ACCEPTED") {
    return new NextResponse("Not available", { status: 404 });
  }

  const address = [
    inquiry.restaurant?.addressLine,
    inquiry.restaurant?.city,
    inquiry.restaurant?.state,
  ]
    .filter(Boolean)
    .join(", ");

  // TABLE accepted => timed booking ICS
  if (inquiry.type === "TABLE" && inquiry.tableInquiry?.bookingAt) {
    const ics = createTableBookingICS({
      restaurantName: inquiry.restaurant?.name ?? "Restaurant",
      restaurantAddress: address,
      customerName: inquiry.name,
      customerEmail: inquiry.email as string,
      organizerEmail: process.env.MAIL_FROM_EMAIL ?? "no-reply@example.com",
      bookingAt: inquiry.tableInquiry.bookingAt,
      durationMinutes: 90,
      inquiryId: inquiry.id,
      notes: inquiry.notes ?? undefined,
    });

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="booking-${id}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // EVENT accepted => all-day ICS (date only)
  if (inquiry.type === "EVENT" && inquiry.eventInquiry?.eventDate) {
    const ics = createEventICS({
      restaurantName: inquiry.restaurant?.name ?? "Restaurant",
      restaurantAddress: address,
      customerName: inquiry.name,
      organizerEmail: process.env.MAIL_FROM_EMAIL ?? "no-reply@example.com",
      inquiryId: inquiry.id,
      eventType: inquiry.eventInquiry.eventType ?? "Event",
      eventDate: inquiry.eventInquiry.eventDate,
      notes: inquiry.notes ?? undefined,
    });

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="event-${id}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse("Not available", { status: 404 });
}
