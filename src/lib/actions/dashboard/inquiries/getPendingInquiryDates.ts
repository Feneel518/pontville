"use server";

import { prisma } from "@/lib/prisma/db";
import { formatRestaurantDate } from "@/lib/helpers/timeHelpers";

export async function getPendingInquiryDates(restaurantId: string) {
  const inquiries = await prisma.inquiry.findMany({
    where: {
      restaurantId,
      status: "PENDING",
    },
    include: {
      tableInquiry: {
        select: {
          bookingAt: true,
        },
      },
      eventInquiry: {
        select: {
          eventDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dateStrings = inquiries
    .map((i) => {
      return formatRestaurantDate(i.createdAt);
    })
    .filter(Boolean);

  return Array.from(new Set(dateStrings));
}
