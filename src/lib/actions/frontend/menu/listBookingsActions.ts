"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";

export const listBookingsAction = async () => {
  await requireAuth();

  const bookings = await prisma.inquiry.findMany({
    where: {
      type: "TABLE",
      status: "ACCEPTED",
      tableInquiry: { isNot: null },
    },
    include: {
      tableInquiry: true,
      handledBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};
