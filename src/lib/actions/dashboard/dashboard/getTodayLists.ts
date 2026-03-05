"use server";

import { getTodayRange } from "@/lib/helpers/timeHelpers";
import { prisma } from "@/lib/prisma/db";


export async function getTodayBookings(restaurantId: string) {
  const { start, end } = getTodayRange("Australia/Hobart");

  return prisma.inquiry.findMany({
    where: {
      restaurantId,
      type: "TABLE",
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
    include: { tableInquiry: true },
    take: 20,
  });
}

export async function getTodayOrders(restaurantId: string) {
  const { start, end } = getTodayRange("Australia/Hobart");

  return prisma.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      total: true,
      customerName: true,
      customerPhone: true,
    },
    take: 20,
  });
}
