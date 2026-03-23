"use server";

import transporter from "@/lib/email/nodemailer";
import { prisma } from "@/lib/prisma/db";
import {
  CreateInquiryInput,
  createInquirySchema,
} from "@/lib/validators/InquiryValidator";
import { getRestaurantId } from "../dashboard/global/getRestaurantd";
import { sendInquiryDecision } from "@/lib/email/sendInquiryDecision";
import {
  adminInquiryReceivedEmail,
  receivedInquiryEmail,
} from "@/lib/email/emailTemplates/inquiryEmailTemplate";
import { createWhatsAppLink } from "@/lib/whatsapp/createWhatsAppLink";
import { sendMail } from "@/lib/email/sendMail";
import { createInquiryActionToken } from "./inquiryActionToken";

export async function createInquiryAction(raw: CreateInquiryInput) {
  const parsed = createInquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter the fields properly.",
    };
  }

  const data = parsed.data;
  const restaurant = await prisma.restaurant.findFirst({
    select: {
      id: true,
      name: true,
      logoUrl: true,
      email: true,
      phone: true,
      addressLine: true,
      city: true,
      state: true,
    },
  });

  const inquiry = await prisma.inquiry.create({
    data: {
      restaurantId: restaurant?.id!,
      type: data.type,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
      ...(data.type === "TABLE"
        ? {
            tableInquiry: {
              create: {
                bookingAt: data.bookingAt,
                guests: data.guests,
              },
            },
          }
        : {
            eventInquiry: {
              create: {
                eventType: data.eventType,
                eventDate: data.eventDate ?? null,
                expectedGuests: data.expectedGuests ?? null,
                budget: data.budget ?? null,
              },
            },
          }),
    },
    include: { tableInquiry: true, eventInquiry: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_API_URL!;
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24h

  const acceptToken = createInquiryActionToken({
    inquiryId: inquiry.id,
    action: "ACCEPTED",
    expiresAt,
  });

  const rejectToken = createInquiryActionToken({
    inquiryId: inquiry.id,
    action: "REJECTED",
    expiresAt,
  });

  const acceptLink = `${appUrl}/api/inquiry/action?i=${inquiry.id}&a=accept&e=${expiresAt}&t=${acceptToken}`;

  const rejectLink = `${appUrl}/api/inquiry/action?i=${inquiry.id}&a=reject&e=${expiresAt}&t=${rejectToken}`;

  if (process.env.RESTAURANT_INBOX_EMAIL) {
    const adminTemplate = adminInquiryReceivedEmail(
      inquiry,
      {
        restaurantName: restaurant?.name ?? "The Pontville Pub",
        primaryColor: "#d4af37",
        logoUrl: restaurant?.logoUrl ?? undefined,
        supportEmail: restaurant?.email ?? undefined,
        supportPhone: restaurant?.phone ?? undefined,
        addressLine: `${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}`,
        websiteUrl: process.env.NEXT_PUBLIC_API_URL ?? undefined,
      },
      {
        dashboardLink: `${process.env.NEXT_PUBLIC_API_URL}/dashboard/inquiries`,
        acceptLink,
        rejectLink,
      },
    );

    await sendMail({
      to: process.env.RESTAURANT_INBOX_EMAIL,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });
  }

  if (inquiry.email) {
    const template = receivedInquiryEmail(
      inquiry,
      {
        restaurantName: restaurant?.name ?? "The Pontville Pub",
        primaryColor: "#d4af37",
        logoUrl: restaurant?.logoUrl ?? undefined,
        supportEmail: restaurant?.email ?? undefined,
        supportPhone: restaurant?.phone ?? undefined,
        addressLine: `${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}`,
        websiteUrl: process.env.NEXT_PUBLIC_API_URL ?? undefined,
      },
      {
        etaText: "within 2 hours", // optional
        manageLink: `${process.env.NEXT_PUBLIC_API_URL}/booking/${inquiry.id}`,
        whatsappLink: process.env.WHATSAPP_BUSINESS_E164
          ? createWhatsAppLink({
              phoneE164: process.env.WHATSAPP_BUSINESS_E164,
              message: `Hi! I just submitted an inquiry. Ref: ${inquiry.id}`,
            })
          : undefined,
      },
    );

    await sendMail({
      to: inquiry.email,
      subject: template.subject,
      html: template.html,
    });
  }

  return { id: inquiry.id };
}
