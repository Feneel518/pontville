"use server";

import { prisma } from "@/lib/prisma/db";

export async function getMenuItemDetailsAction(menuItemId: string) {
  const item = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    select: {
      id: true,
      name: true,
      priceType: true,
      basePrice: true,
      imageUrl: true,

      variants: {
        where: { isAvailable: true },
        orderBy: { price: "asc" },
        select: { id: true, name: true, price: true, isAvailable: true },
      },

      addOnGroups: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          selection: true,
          minSelect: true,
          maxSelect: true,
          addOns: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, price: true, isAvailable: true },
          },
        },
      },
    },
  });

  if (!item) return { ok: false as const };
  return { ok: true as const, item };
}
