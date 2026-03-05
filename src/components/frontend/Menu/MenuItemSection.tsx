import MenuItemsList from "@/components/dashboard/menu/menuItem/MenuItemsList";
import { prisma } from "@/lib/prisma/db";
import { unstable_cache } from "next/cache";

const getMenuItemsByCategory = unstable_cache(
  async (categoryId: string) => {
    return prisma.menuItem.findMany({
      where: {
        categoryId,
        deletedAt: null,
        status: "ACTIVE",
        isAvailable: true, // add if you have this field, huge filter
      },
      orderBy: { imageUrl: "asc" }, // if exists
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
  //   @ts-ignore
  (categoryId: string) => [`menu-items-by-category:${categoryId}`],
  { revalidate: 30 }, // tune: 30s/60s/300s depending on how often menu changes
);

export default async function MenuItemsSection({
  open,
  menuId,
  categoryId,
  categoryName,
  categorySlug,
}: {
  open: {
    isOpen: boolean;
    closesAt?: string;
    opensAt?: string;
  };
  menuId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}) {
  const items = await getMenuItemsByCategory(categoryId);

  return (
    <MenuItemsList
      open={open}
      menuId={menuId}
      items={items}
      categoryName={categoryName}
      categorySlug={categorySlug}
    />
  );
}
