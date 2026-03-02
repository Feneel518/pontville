import type { Prisma } from "@prisma/client";

export const menuItemCardSelect = {
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
    orderBy: { sortOrder: "asc" as const },
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
        orderBy: { sortOrder: "asc" as const },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.MenuItemSelect;

// ✅ This is the raw DB shape (prices are Prisma.Decimal)
export type MenuItemCardSelect = Prisma.MenuItemGetPayload<{
  select: typeof menuItemCardSelect;
}>;
