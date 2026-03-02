"use server";

import { prisma } from "@/lib/prisma/db";

export async function getAddOnOptionsAction(menuItemIds: string[]) {
  if (!menuItemIds.length) return [];

  const items = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, deletedAt: null },
    select: {
      id: true,
      addOnGroups: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          selection: true, // SINGLE | MULTI (we can still respect this)
          minSelect: true,
          maxSelect: true,
          addOns: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, price: true },
          },
        },
      },
    },
  });

  return items;
}
