"use server";

import { sendInquiryDecision } from "@/lib/email/sendInquiryDecision";
import { prisma } from "@/lib/prisma/db";

export async function performInquiryDecision(params: {
  inquiryId: string;
  status: "ACCEPTED" | "REJECTED";
  staffNote?: string | null;
  handledById?: string | null;
}) {
  const { inquiryId, status, staffNote, handledById } = params;

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

  const inquiry = await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      staffNote: staffNote ?? null,
      handledById: handledById ?? null,
      handledAt: new Date(),
    },
    include: {
      tableInquiry: true,
      eventInquiry: true,
    },
  });

  if (inquiry.email) {
    await sendInquiryDecision({
      inquiry,
      brand: {
        restaurantName: restaurant?.name ?? "The Pontville Pub",
        primaryColor: "#d4af37",
        logoUrl: restaurant?.logoUrl ?? undefined,
        supportEmail: restaurant?.email ?? undefined,
        supportPhone: restaurant?.phone ?? undefined,
        addressLine:
          `${restaurant?.addressLine ?? ""}, ${restaurant?.city ?? ""}, ${restaurant?.state ?? ""}`.replace(
            /^,\s*|,\s*$/g,
            "",
          ),
        websiteUrl: process.env.NEXT_PUBLIC_API_URL ?? undefined,
      },
      whatsappBusinessPhoneE164: process.env.WHATSAPP_BUSINESS_E164,
      manageLink: `${process.env.PUBLIC_APP_URL}/booking/${inquiry.id}`,
    });
  }

  return inquiry;
}
