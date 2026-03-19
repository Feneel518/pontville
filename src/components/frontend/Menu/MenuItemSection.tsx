import MenuItemsList from "@/components/dashboard/menu/menuItem/MenuItemsList";
import { MenuOpenStatus } from "@/hooks/useMenuOpenStatus";
import { Weekday } from "@/lib/helpers/WeekDaysHelpers";
import { OpeningHour } from "@/lib/menuChecks/menuAvailability";
import { prisma } from "@/lib/prisma/db";
import { MenuAvailabilityState } from "@/lib/types/menuAvailability";
import { unstable_cache } from "next/cache";

const getMenuItemsByCategory = unstable_cache(
  async (categoryId: string) => {
    return prisma.menuItem.findMany({
      where: {
        categoryId,
        deletedAt: null,
        status: "ACTIVE",
        isAvailable: true,
      },
      orderBy: { imageUrl: "asc" },
      include: {
        addOnGroups: {
          include: {
            addOns: true,
          },
        },
        variants: true,
      },
    });
  },
  // @ts-ignore
  (categoryId: string) => [`menu-items-by-category:${categoryId}`],
  { revalidate: 30 },
);

export default async function MenuItemsSection({
  initialOpen,
  openingHours,
  timezone,
  menuId,
  categoryId,
  categoryName,
  categorySlug,
}: {
  menuId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  initialOpen: MenuOpenStatus;
  openingHours: OpeningHour[];
  timezone: string;
}) {
  const items = await getMenuItemsByCategory(categoryId);

  return (
    <MenuItemsList
      initialOpen={initialOpen}
      openingHours={openingHours}
      timezone={timezone}
      menuId={menuId}
      items={items}
      categoryName={categoryName}
      categorySlug={categorySlug}
    />
  );
}
