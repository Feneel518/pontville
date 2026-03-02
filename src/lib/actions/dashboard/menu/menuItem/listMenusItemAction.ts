"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import {
  buildMenuItemOrderBy,
  buildMenuItemWhere,
} from "@/lib/searchParams/MenuItemRepo";
import { menuItemQP } from "@/lib/searchParams/MenuItemSearchParams";

export const listMenuItemsAction = async (
  qp: menuItemQP,
  activeCategorySlug: string,
) => {
  await requireAuth();

  const sp = qp;
  const pageParams = Math.max(1, sp.page);
  const pageSizeParams = Math.min(50, Math.max(5, sp.pageSize));

  const where = buildMenuItemWhere(sp, activeCategorySlug);
  const orderBy = buildMenuItemOrderBy(sp);

  const [item, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      orderBy: orderBy as any,
      skip: (pageParams - 1) * pageSizeParams,
      take: pageSizeParams,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        priceType: true,
        basePrice: true,
        status: true,
        isAvailable: true,
        sortOrder: true,
        deletedAt: true,
        isVeg: true,
        isVegan: true,
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        addOnGroups: {
          select: {
            id: true,
            name: true,
            selection: true,
            minSelect: true,
            maxSelect: true,
            sortOrder: true,
            addOns: {
              select: {
                id: true,
                name: true,
                price: true,
                isAvailable: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    }),

    prisma.menuItem.count({ where }),
  ]);

  return {
    items: item,
    total,
    page: pageParams,
    pageSize: pageSizeParams,
  };
};
