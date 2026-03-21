"use server";

import { getRestaurantDayUtcRange } from "@/lib/helpers/timeHelpers";
import { prisma } from "@/lib/prisma/db";

export type InquiriesView = "pending" | "accepted" | "rejected" | "all";

export async function listInquiriesForDate(opts: {
  restaurantId: string;
  dateStr: string;
  view: InquiriesView;
  pageSize: number;
  cursor?: string;
  excludeDate?: boolean;
  q?: string;
  type?: "TABLE" | "EVENT";
}) {
  const {
    restaurantId,
    dateStr,
    view,
    pageSize,
    cursor,
    q,
    type,
    excludeDate,
  } = opts;

  const { startUtc, endUtc } = getRestaurantDayUtcRange(dateStr);

  const statusWhere =
    view === "pending"
      ? { status: "PENDING" as const }
      : view === "accepted"
        ? { status: "ACCEPTED" as const }
        : view === "rejected"
          ? { status: "REJECTED" as const }
          : {};

  const dateWhere = excludeDate
    ? {
        createdAt: {
          lt: startUtc,
        },
      }
    : {
        createdAt: {
          gte: startUtc,
          lt: new Date(endUtc.getTime() + 1),
        },
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
    restaurantId,
    ...statusWhere,
    ...(type ? { type } : {}),
    ...dateWhere,
    ...searchWhere,
  };

  const countWhere = {
    restaurantId,
    ...(type ? { type } : {}),
    ...dateWhere,
    ...searchWhere,
  };

  const pendingCount = await prisma.inquiry.count({
    where: {
      ...countWhere,
      status: "PENDING",
    },
  });

  const acceptedCount = await prisma.inquiry.count({
    where: {
      ...countWhere,
      status: "ACCEPTED",
    },
  });

  const rejectedCount = await prisma.inquiry.count({
    where: {
      ...countWhere,
      status: "REJECTED",
    },
  });

  const items = await prisma.inquiry.findMany({
    where,
    include: {
      tableInquiry: true,
      eventInquiry: true,
    },
    orderBy: { createdAt: "desc" },
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > pageSize;
  const slice = hasMore ? items.slice(0, pageSize) : items;
  const nextCursor = hasMore ? (slice[slice.length - 1]?.id ?? null) : null;

  return {
    inquiries: slice,
    nextCursor,
    pendingCount,
    acceptedCount,
    rejectedCount,
  };
}
