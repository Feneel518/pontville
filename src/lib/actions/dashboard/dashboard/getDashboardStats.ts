// src/lib/actions/dashboard/getDashboardStats.ts
"use server";

import { getTodayRange } from "@/lib/helpers/timeHelpers";
import { prisma } from "@/lib/prisma/db";


export async function getDashboardStats(restaurantId: string) {
  const { start, end } = getTodayRange("Australia/Hobart");

  const [
    // bookings today
    bookingsTodayCount,
    pendingBookingsTodayCount,

    // inquiries today (all)
    inquiriesTodayCount,

    // orders today
    ordersTodayCount,
    paidOrdersTodayCount,

    // revenue today (paid only)
    paidTotalsToday,

    // top items today (optional)
    topItemsToday,
  ] = await Promise.all([
    prisma.tableInquiry.count({
      where: {
        inquiry: {
          restaurantId,
          type: "TABLE",
          createdAt: { gte: start, lte: end },
        },
      },
    }),

    prisma.tableInquiry.count({
      where: {
        inquiry: {
          restaurantId,
          type: "TABLE",
          status: "PENDING",
          createdAt: { gte: start, lte: end },
        },
      },
    }),

    prisma.inquiry.count({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
      },
    }),

    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
      },
    }),

    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
        paymentStatus: "PAID",
      },
    }),

    prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: { gte: start, lte: end },
        paymentStatus: "PAID",
      },
      _sum: { subtotal: true, tax: true, packingFee: true, total: true },
    }),

    prisma.orderItem.groupBy({
      by: ["snapshotItemName"],
      where: {
        order: {
          restaurantId,
          createdAt: { gte: start, lte: end },
          paymentStatus: "PAID",
        },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: [{ _sum: { quantity: "desc" } }],
      take: 6,
    }),
  ]);

  return {
    range: { start, end },

    bookings: {
      todayCount: bookingsTodayCount,
      pendingTodayCount: pendingBookingsTodayCount,
    },

    inquiries: {
      todayCount: inquiriesTodayCount,
    },

    orders: {
      todayCount: ordersTodayCount,
      paidTodayCount: paidOrdersTodayCount,
    },

    revenue: {
      subtotal: paidTotalsToday._sum.subtotal ?? 0,
      tax: paidTotalsToday._sum.tax ?? 0,
      packingFee: paidTotalsToday._sum.packingFee ?? 0,
      total: paidTotalsToday._sum.total ?? 0,
    },

    topItems: topItemsToday.map((x) => ({
      name: x.snapshotItemName,
      qty: x._sum.quantity ?? 0,
      revenue: x._sum.lineTotal ?? 0,
    })),
  };
}
