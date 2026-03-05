"use server";

import { prisma } from "@/lib/prisma/db";

export async function getBookingById(opts: {
  restaurantId: string;
  id: string;
}) {
  const booking = await prisma.inquiry.findFirst({
    where: {
      id: opts.id,
      restaurantId: opts.restaurantId,
      type: "TABLE",
      status: { in: ["ACCEPTED", "CANCELLED"] },
    },
    include: {
      tableInquiry: true,
      handledBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!booking) throw new Error("Booking not found");
  return booking;
}
