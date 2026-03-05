"use server";

import { prisma } from "@/lib/prisma/db";

export async function dayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);
  return { start, end };
}

export async function listAcceptedBookingsForDay(opts: {
  restaurantId: string;
  dateStr: string; // YYYY-MM-DD
}) {
  const { start, end } = await dayRange(opts.dateStr);

  const rows = await prisma.inquiry.findMany({
    where: {
      restaurantId: opts.restaurantId,
      type: "TABLE",
      status: "ACCEPTED",
      tableInquiry: {
        is: {
          bookingAt: { gte: start, lte: end },
        },
      },
    },
    include: { tableInquiry: true },
    orderBy: [{ tableInquiry: { bookingAt: "asc" } }, { createdAt: "asc" }],
  });

  return rows;
}

export async function listPendingTableInquiriesForDay(opts: {
  restaurantId: string;
  dateStr: string; // YYYY-MM-DD
}) {
  const { start, end } = await dayRange(opts.dateStr);

  const rows = await prisma.inquiry.findMany({
    where: {
      restaurantId: opts.restaurantId,
      type: "TABLE",
      status: "PENDING",
      tableInquiry: {
        is: {
          bookingAt: { gte: start, lte: end },
        },
      },
    },
    include: { tableInquiry: true },
    orderBy: [{ tableInquiry: { bookingAt: "asc" } }, { createdAt: "asc" }],
  });

  return rows;
}
