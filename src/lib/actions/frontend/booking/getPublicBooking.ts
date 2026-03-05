"use server";

import { prisma } from "@/lib/prisma/db";

export async function getPublicBooking(opts: { id: string }) {
  // IMPORTANT:
  // This exposes inquiry by id. For stronger security, add a publicToken field and require both.
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: opts.id },
    include: {
      tableInquiry: true,
      eventInquiry: true,
      restaurant: {
        select: {
          name: true,
          logoUrl: true,
          phone: true,
          email: true,
          addressLine: true,
          city: true,
          state: true,
        },
      },
    },
  });

  if (!inquiry) return null;
  return inquiry;
}
