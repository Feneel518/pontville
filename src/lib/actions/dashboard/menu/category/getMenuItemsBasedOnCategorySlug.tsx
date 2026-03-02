import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";

export const getMenuItemsBasedOnCategorySlug = async (slug: string) => {
  await requireAuth();

  const items = await prisma.menuItem.findMany({
    where: { categoryId: slug },
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
      categoryId:true,

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
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return { ok: true, items };
};
