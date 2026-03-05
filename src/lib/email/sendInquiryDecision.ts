"use server";

import { EventInquiry, Inquiry, TableInquiry } from "@prisma/client";
import {
  acceptedInquiryEmail,
  BrandConfig,
  rejectedInquiryEmail,
} from "./emailTemplates/inquiryEmailTemplate";
import { createTableBookingICS } from "../calendar/calendar";
import { createWhatsAppLink } from "../whatsapp/createWhatsAppLink";
import { sendMail } from "./sendMail";

type FullInquiry = Inquiry & {
  tableInquiry?: TableInquiry | null;
  eventInquiry?: EventInquiry | null;
};

export async function sendInquiryDecision(opts: {
  inquiry: FullInquiry;
  brand: BrandConfig;

  // WhatsApp business number (your restaurant number)
  whatsappBusinessPhoneE164?: string;

  // optional: link on your site to show inquiry detail
  manageLink?: string;
}) {
  const { inquiry, brand } = opts;

  if (!inquiry.email) return; // nothing to email

  const whenText =
    inquiry.type === "TABLE"
      ? inquiry.tableInquiry?.bookingAt
        ? inquiry.tableInquiry.bookingAt.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-"
      : inquiry.eventInquiry?.eventDate
        ? inquiry.eventInquiry.eventDate.toLocaleDateString("en-IN", {
            dateStyle: "medium",
          })
        : "-";

  const whatsappLink = opts.whatsappBusinessPhoneE164
    ? createWhatsAppLink({
        phoneE164: opts.whatsappBusinessPhoneE164,
        message:
          inquiry.status === "ACCEPTED"
            ? `Hi ${inquiry.name}! ✅ My request is accepted. Ref: ${inquiry.id}\nType: ${inquiry.type}\nWhen: ${whenText}`
            : `Hi ${inquiry.name}! I want to try alternative options. Ref: ${inquiry.id}\nType: ${inquiry.type}`,
      })
    : undefined;

  const template =
    inquiry.status === "ACCEPTED"
      ? acceptedInquiryEmail(inquiry, brand, {
          whatsappLink,
          manageLink: opts.manageLink,
        })
      : rejectedInquiryEmail(inquiry, brand, {
          whatsappLink,
          manageLink: opts.manageLink,
        });

  const attachments: Array<{
    filename: string;
    content: string;
    contentType: string;
  }> = [];

  let icalEvent: { method: "request"; content: string } | undefined;
  // Attach ICS only for TABLE + ACCEPTED
  if (
    inquiry.status === "ACCEPTED" &&
    inquiry.type === "TABLE" &&
    inquiry.tableInquiry?.bookingAt &&
    inquiry.email
  ) {
    const ics = createTableBookingICS({
      restaurantName: brand.restaurantName,
      restaurantAddress: brand.addressLine,
      customerName: inquiry.name,
      customerEmail: inquiry.email, // ✅
      organizerEmail: process.env.MAIL_FROM_EMAIL!, // ✅ set this
      bookingAt: inquiry.tableInquiry.bookingAt,
      durationMinutes: 90,
      inquiryId: inquiry.id,
      notes: inquiry.notes ?? undefined,
    });

    icalEvent = { method: "request", content: ics };

    attachments.push({
      filename: `${brand.restaurantName.replace(/\s+/g, "-").toLowerCase()}-booking.ics`,
      content: ics,
      contentType: "text/calendar; charset=utf-8; method=REQUEST",
    });
  }

  await sendMail({
    to: inquiry.email,
    subject: template.subject,
    html: template.html,
    attachments: attachments.length ? attachments : undefined,
  });
}
