"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma/db";
import { requireAuth } from "@/lib/checks/requireAuth";
import { createWhatsAppLink } from "@/lib/whatsapp/createWhatsAppLink";
import { cancelledBookingEmail } from "@/lib/email/emailTemplates/inquiryEmailTemplate";
import { sendMail } from "@/lib/email/sendMail";
// optionally send email
// import { sendMail } from "@/lib/email/sendMail";

const schema = z.object({
  id: z.string().min(1),
  reason: z.string().max(1000).optional(),
});

export async function cancelBookingAction(input: z.infer<typeof schema>) {
  const { id, reason } = schema.parse(input);
  const session = await requireAuth();

  const booking = await prisma.inquiry.update({
    where: { id },
    data: {
      status: "CANCELLED",
      staffNote: reason?.trim() ? reason.trim() : null,
      handledById: session.user.id,
      handledAt: new Date(),
    },
    include: { tableInquiry: true },
  });

  const restaurant = await prisma.restaurant.findFirst({
    select: {
      name: true,
      logoUrl: true,
      email: true,
      phone: true,
      addressLine: true,
      city: true,
      state: true,
    },
  });

  if (booking.email) {
    const brand = {
      restaurantName: restaurant?.name ?? "The Pontville Pub",
      primaryColor: "#d4af37",
      logoUrl: restaurant?.logoUrl ?? undefined,
      supportEmail: restaurant?.email ?? undefined,
      supportPhone: restaurant?.phone ?? undefined,
      addressLine: `${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}`,
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL ?? undefined,
    };

    const whatsappLink = process.env.WHATSAPP_BUSINESS_E164
      ? createWhatsAppLink({
          phoneE164: process.env.WHATSAPP_BUSINESS_E164,
          message: `Hi, I want to rebook my table. Ref: ${booking.id}`,
        })
      : undefined;

    const template = cancelledBookingEmail(booking as any, brand, {
      whatsappLink,
      manageLink: process.env.PUBLIC_APP_URL
        ? `${process.env.PUBLIC_APP_URL}/booking/${booking.id}`
        : undefined,
    });

    await sendMail({
      to: booking.email,
      subject: template.subject,
      html: template.html,
    });
  }

  return { ok: true };
}
