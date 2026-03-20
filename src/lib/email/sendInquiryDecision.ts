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
import {
  formatRestaurantDate,
  formatRestaurantDateTime,
} from "@/lib/helpers/timeHelpers";

type FullInquiry = Inquiry & {
  tableInquiry?: TableInquiry | null;
  eventInquiry?: EventInquiry | null;
};

export async function sendInquiryDecision(opts: {
  inquiry: FullInquiry;
  brand: BrandConfig;
  whatsappBusinessPhoneE164?: string;
  manageLink?: string;
}) {
  const { inquiry, brand } = opts;

  if (!inquiry.email) return;

  const whenText =
    inquiry.type === "TABLE"
      ? inquiry.tableInquiry?.bookingAt
        ? formatRestaurantDateTime(inquiry.tableInquiry.bookingAt)
        : "-"
      : inquiry.eventInquiry?.eventDate
        ? formatRestaurantDate(inquiry.eventInquiry.eventDate)
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
      customerEmail: inquiry.email,
      organizerEmail: process.env.MAIL_FROM_EMAIL!,
      bookingAt: inquiry.tableInquiry.bookingAt,
      durationMinutes: 90,
      inquiryId: inquiry.id,
      notes: inquiry.notes ?? undefined,
    });

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
