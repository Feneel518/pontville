import { prisma } from "@/lib/prisma/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export type OrdersView = "pending" | "paid" | "all";

function startEndOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function parseDateParam(dateStr?: string) {
  // expects YYYY-MM-DD
  if (!dateStr) return new Date();
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
export async function listOrdersForDate(args: {
  restaurantId: string;
  dateStr?: string; // YYYY-MM-DD
  view?: OrdersView;
  pageSize?: number;
  cursor?: string; // order.id
}) {
  const {
    restaurantId,
    dateStr,
    view = "pending",
    pageSize = 30,
    cursor,
  } = args;

  const date = parseDateParam(dateStr);
  const { start, end } = startEndOfDay(date);

  // Views:
  // - pending: kitchen pipeline orders (NEW/ACCEPTED/PREPARING/READY)
  // - paid: paymentStatus=PAID
  // - all: everything for that date
  const where: any = {
    restaurantId,
    createdAt: { gte: start, lte: end },
  };

  if (view === "pending") {
    where.status = {
      in: ["NEW", "ACCEPTED", "PREPARING", "READY"] as OrderStatus[],
    };
    where.paymentStatus = {
      in: ["PAID", "UNPAID", "REQUIRES_ACTION"] as PaymentStatus[],
    };
  } else if (view === "paid") {
    where.paymentStatus = "PAID" as PaymentStatus;
  }

  const orders = await prisma.order.findMany({
    where,
    take: pageSize + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      items: {
        include: {
          addOns: true,
        },
      },
    },
  });

  const hasNextPage = orders.length > pageSize;
  const data = hasNextPage ? orders.slice(0, pageSize) : orders;
  const nextCursor = hasNextPage ? data[data.length - 1]?.id : null;

  // fast summary counts for header chips
  const [pendingCount, paidCount] = await Promise.all([
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
        status: {
          in: ["NEW", "ACCEPTED", "PREPARING", "READY"] as OrderStatus[],
        },
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
        paymentStatus: "PAID" as PaymentStatus,
      },
    }),
  ]);

  const revenueAgg = await prisma.order.aggregate({
    where: {
      restaurantId,
      createdAt: { gte: start, lte: end },
      paymentStatus: "PAID",
    },
    _sum: { total: true },
  });

  const revenuePaid = revenueAgg._sum.total ?? 0;

  return {
    date,
    orders: data,
    nextCursor,
    pendingCount,
    paidCount,
    revenuePaid,
  };
}
