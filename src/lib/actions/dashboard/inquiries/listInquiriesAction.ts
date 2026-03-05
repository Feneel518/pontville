"use server";

import { prisma } from "@/lib/prisma/db";

export type InquiriesView = "pending" | "accepted" | "rejected" | "all";

export async function listInquiriesForDate(opts: {
  restaurantId: string;
  dateStr: string; // YYYY-MM-DD (filter by bookingAt/eventDate OR createdAt fallback)
  view: InquiriesView;
  pageSize: number;
  cursor?: string;

  // optional search (name/email/phone)
  q?: string;
  type?: "TABLE" | "EVENT"; // optional filter
}) {
  const { restaurantId, dateStr, view, pageSize, cursor, q, type } = opts;

  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);

  const statusWhere =
    view === "pending"
      ? { status: "PENDING" as const }
      : view === "accepted"
        ? { status: "ACCEPTED" as const }
        : view === "rejected"
          ? { status: "REJECTED" as const }
          : {};

  // Date filter:
  // - TABLE: tableInquiry.bookingAt in day
  // - EVENT: eventInquiry.eventDate in day
  // - If eventDate is null (some events may not pick a date), we fallback to createdAt filter
  const dateWhere = {
    createdAt: { gte: start, lte: end },
  };

  const searchWhere = q?.trim()
    ? {
        OR: [
          { name: { contains: q.trim(), mode: "insensitive" as const } },
          { email: { contains: q.trim(), mode: "insensitive" as const } },
          { phone: { contains: q.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = {
    ...statusWhere,
    ...(type ? { type } : {}),
    ...dateWhere,
    ...searchWhere,
  };

  const pendingCount = await prisma.inquiry.count({
    where: {
      status: "PENDING",
      ...dateWhere,
      ...(type ? { type } : {}),
      ...searchWhere,
    },
  });
  const acceptedCount = await prisma.inquiry.count({
    where: {
      status: "ACCEPTED",
      ...dateWhere,
      ...(type ? { type } : {}),
      ...searchWhere,
    },
  });
  const rejectedCount = await prisma.inquiry.count({
    where: {
      status: "REJECTED",
      ...dateWhere,
      ...(type ? { type } : {}),
      ...searchWhere,
    },
  });

  console.log(where);

  const items = await prisma.inquiry.findMany({
    where,
    include: { tableInquiry: true, eventInquiry: true },
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > pageSize;
  const slice = hasMore ? items.slice(0, pageSize) : items;
  const nextCursor = hasMore ? (slice[slice.length - 1]?.id ?? null) : null;

  console.log(items);

  return {
    inquiries: slice,
    nextCursor,
    pendingCount,
    acceptedCount,
    rejectedCount,
  };
}
