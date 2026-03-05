"use server";

import { prisma } from "@/lib/prisma/db";
import { Prisma } from "@prisma/client";

export type BookingsView = "accepted" | "cancelled" | "all";

function dayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);
  return { start, end };
}

export async function listBookingsForDate(opts: {
  restaurantId: string;
  dateStr: string; // bookingAt date filter
  view: BookingsView;
  pageSize: number;
  cursor?: string;
  q?: string; // name/email/phone
}) {
  const { start, end } = dayRange(opts.dateStr);

  const statusWhere: Prisma.InquiryWhereInput =
    opts.view === "accepted"
      ? { status: "ACCEPTED" as const }
      : opts.view === "cancelled"
        ? { status: "CANCELLED" as const }
        : { status: { in: ["ACCEPTED", "CANCELLED"] as const } };

  const searchWhere = opts.q?.trim()
    ? {
        OR: [
          { name: { contains: opts.q.trim(), mode: "insensitive" as const } },
          { email: { contains: opts.q.trim(), mode: "insensitive" as const } },
          { phone: { contains: opts.q.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = {
    restaurantId: opts.restaurantId,
    type: "TABLE" as const,
    ...statusWhere,
    ...searchWhere,
    tableInquiry: { is: { bookingAt: { gte: start, lte: end } } },
  };

  const acceptedCount = await prisma.inquiry.count({
    where: {
      restaurantId: opts.restaurantId,
      type: "TABLE",
      status: "ACCEPTED",
      ...searchWhere,
      tableInquiry: { is: { bookingAt: { gte: start, lte: end } } },
    },
  });

  const cancelledCount = await prisma.inquiry.count({
    where: {
      restaurantId: opts.restaurantId,
      type: "TABLE",
      status: "CANCELLED",
      ...searchWhere,
      tableInquiry: { is: { bookingAt: { gte: start, lte: end } } },
    },
  });

  const rows = await prisma.inquiry.findMany({
    where,
    include: { tableInquiry: true },
    orderBy: [{ tableInquiry: { bookingAt: "asc" } }, { createdAt: "asc" }],
    take: opts.pageSize + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > opts.pageSize;
  const slice = hasMore ? rows.slice(0, opts.pageSize) : rows;
  const nextCursor = hasMore ? (slice[slice.length - 1]?.id ?? null) : null;

  return {
    bookings: slice,
    nextCursor,
    acceptedCount,
    cancelledCount,
  };
}
