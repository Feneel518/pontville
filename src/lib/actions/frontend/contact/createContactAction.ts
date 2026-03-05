"use server";

import {
  adminContactReceivedEmail,
  adminInquiryReceivedEmail,
  receivedInquiryEmail,
} from "@/lib/email/emailTemplates/inquiryEmailTemplate";
import { sendMail } from "@/lib/email/sendMail";
import { prisma } from "@/lib/prisma/db";
import { ContactInput, contactSchema } from "@/lib/validators/contactValidator";
import {
  CreateInquiryInput,
  createInquirySchema,
} from "@/lib/validators/InquiryValidator";
import { createWhatsAppLink } from "@/lib/whatsapp/createWhatsAppLink";

export async function createContactAction(raw: ContactInput) {
  const parsed = contactSchema.safeParse(raw);

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

  if (process.env.RESTAURANT_INBOX_EMAIL) {
    const adminTemplate = adminContactReceivedEmail(
      {
        email: data.email!,
        name: data.name,
        note: data.notes,
        phone: data.phone,
      },
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
      },
    );

    await sendMail({
      to: process.env.RESTAURANT_INBOX_EMAIL,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });
  }

  return { ok: true };
}
