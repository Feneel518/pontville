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
    nextChangeAt?: string;
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
