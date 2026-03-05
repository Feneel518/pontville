"use server";

import { prisma } from "@/lib/prisma/db";

export async function getInquiryById(opts: {
  restaurantId: string;
  inquiryId: string;
}) {
  const inquiry = await prisma.inquiry.findFirst({
    where: { id: opts.inquiryId, restaurantId: opts.restaurantId },
    include: {
      tableInquiry: true,
      eventInquiry: true,
      handledBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!inquiry) throw new Error("Inquiry not found");
  return inquiry;
}
