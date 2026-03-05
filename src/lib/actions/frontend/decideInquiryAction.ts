"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { sendInquiryDecision } from "@/lib/email/sendInquiryDecision";
import { prisma } from "@/lib/prisma/db";
import z from "zod";

const updateSchema = z.object({
  inquiryId: z.string().min(1),
  status: z.enum(["ACCEPTED", "REJECTED"]),
  staffNote: z.string().max(1000).optional(),
});

export async function decideInquiryAction(input: z.infer<typeof updateSchema>) {
  const { inquiryId, status, staffNote } = updateSchema.parse(input);
  const session = await requireAuth(); // your permission key

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
      handledById: session.user.id,
      handledAt: new Date(),
    },
    include: { tableInquiry: true, eventInquiry: true },
  });

  if (inquiry.email) {
   
    await sendInquiryDecision({
      inquiry,
      brand: {
        restaurantName: restaurant?.name ?? "The Pontville Pub",
        primaryColor: "#d4af37", // luxury gold (change to your theme)
        logoUrl: restaurant?.logoUrl ?? undefined,
        supportEmail: restaurant?.email ?? undefined,
        supportPhone: restaurant?.phone ?? undefined,
        addressLine: `${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}`,
        websiteUrl: process.env.NEXT_PUBLIC_API_URL ?? undefined,
      },
      whatsappBusinessPhoneE164: process.env.WHATSAPP_BUSINESS_E164, // e.g. "+61xxxxxxxxx"
      manageLink: `${process.env.PUBLIC_APP_URL}/booking/${inquiry.id}`, // optional
    });
  }

  return { ok: true };
}
