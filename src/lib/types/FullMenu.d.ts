import { Prisma } from "@prisma/client";

export type MenuItemCardSelect = Prisma.MenuItemGetPayload<{
  include: {
    addOnGroups: {
      include: {
        addOns: true;
      };
    };

    variants: true;
  };
}>;

export type FullMenuItemCardSelect = Prisma.MenuItemGetPayload<{
  include: {
    addOnGroups: {
      include: {
        addOns: true;
      };
    };
    variants: true;
    category: {
      include: {
        menu: {
          include: {
            openingHours: true;
          };
        };
      };
    };
  };
}>;
