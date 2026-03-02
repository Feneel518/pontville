import { prisma } from "@/lib/prisma/db";
import { getRestaurantId } from "../global/getRestaurantd";
import { menuQP } from "@/lib/searchParams/MenuSearchParams";
import { requireAuth } from "@/lib/checks/requireAuth";
import {
  buildMenusOrderBy,
  buildMenusWhere,
} from "@/lib/searchParams/MenuRepo";

export async function listMenusAction(sp: menuQP) {
  await requireAuth();

  const pageParams = Math.max(1, sp.page);
  const pageSizeParams = Math.min(50, Math.max(5, sp.pageSize));

  const where = buildMenusWhere(sp);
  const orderBy = buildMenusOrderBy(sp);

  const restaurantId = await getRestaurantId();

  const [item, total] = await Promise.all([
    prisma.menu.findMany({
      where,
      orderBy: orderBy as any,
      skip: (pageParams - 1) * pageSizeParams,
      take: pageSizeParams,
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        status: true,
        updatedAt: true,
        restaurantId: true,
        description: true,
        imageUrl: true,
        categories: {
          select: { id: true, slug: true },
        },
        openingHours: true,
      },
    }),

    prisma.menu.count({ where }),
  ]);

  return {
    items: item,
    total,
    page: pageParams,
    pageSize: pageSizeParams,
  };
}
