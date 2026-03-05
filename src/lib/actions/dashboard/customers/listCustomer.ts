"use server";

import { prisma } from "@/lib/prisma/db";

type CustomerRow = {
  key: string; // phone/email key
  name: string;
  phone?: string | null;
  email?: string | null;
  lastSeenAt: Date;
  ordersCount: number;
  totalSpent: number; // cents
  inquiriesCount: number;
};

function keyOf(phone?: string | null, email?: string | null) {
  const p = (phone || "").replace(/\s+/g, "");
  if (p) return `phone:${p}`;
  const e = (email || "").trim().toLowerCase();
  if (e) return `email:${e}`;
  return null;
}

export async function listCustomers(restaurantId: string) {
  // Pull recent data; expand later with pagination
  const [orders, inquiries] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId },
      select: {
        createdAt: true,
        customerName: true,
        customerPhone: true,
        paymentStatus: true,
        total: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.inquiry.findMany({
      where: { restaurantId },
      select: { createdAt: true, name: true, phone: true, email: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  const map = new Map<string, CustomerRow>();

  for (const o of orders) {
    const k = keyOf(o.customerPhone, null);
    if (!k) continue;

    const existing = map.get(k);
    const spent = o.paymentStatus === "PAID" ? o.total : 0;

    if (!existing) {
      map.set(k, {
        key: k,
        name: o.customerName || "—",
        phone: o.customerPhone,
        email: null,
        lastSeenAt: o.createdAt,
        ordersCount: 1,
        totalSpent: spent,
        inquiriesCount: 0,
      });
    } else {
      existing.ordersCount += 1;
      existing.totalSpent += spent;
      if (o.createdAt > existing.lastSeenAt) existing.lastSeenAt = o.createdAt;
      if (!existing.name && o.customerName) existing.name = o.customerName;
    }
  }

  for (const i of inquiries) {
    const k = keyOf(i.phone, i.email);
    if (!k) continue;

    const existing = map.get(k);
    if (!existing) {
      map.set(k, {
        key: k,
        name: i.name || "—",
        phone: i.phone,
        email: i.email,
        lastSeenAt: i.createdAt,
        ordersCount: 0,
        totalSpent: 0,
        inquiriesCount: 1,
      });
    } else {
      existing.inquiriesCount += 1;
      if (i.createdAt > existing.lastSeenAt) existing.lastSeenAt = i.createdAt;
      if (!existing.email && i.email) existing.email = i.email;
      if (!existing.phone && i.phone) existing.phone = i.phone;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
  );
}
