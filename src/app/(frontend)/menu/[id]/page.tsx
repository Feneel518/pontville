import MenuItemsList from "@/components/dashboard/menu/menuItem/MenuItemsList";
import MenuCategoriesPublicToolbar from "@/components/frontend/Menu/MenuCategoriesPublicToolbar";
import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";
import { prisma } from "@/lib/prisma/db";
import { redirect } from "next/navigation";

import { FC } from "react";

interface pageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ params, searchParams }) => {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const menu = await prisma.menu.findUnique({
    where: { id },
    select: {
      openingHours: true,
      categories: {
        select: { id: true, name: true, slug: true },
        orderBy: { sortOrder: "asc" }, // if exists
      },
    },
  });

  if (!menu) redirect("/");

  const categories = menu.categories;
  if (!categories.length) return <Heading label="No Categories found" />;

  const requestedSlug =
    typeof sp.category === "string" ? sp.category : undefined;
  const activeSlug = requestedSlug ?? categories[0].slug;
  const activeCategory =
    categories.find((c) => c.slug === activeSlug) ?? categories[0];

  const open = isMenuOpenNow({
    openingHours: menu.openingHours,
    now: new Date(),
  });

  return (
    <SectionComponent>
      <MenuCategoriesPublicToolbar
        categories={categories}
        selected={activeCategory?.id}></MenuCategoriesPublicToolbar>

      {/* streams separately, keeps page responsive */}
      <MenuItemsSection
        open={open}
        menuId={id}
        categoryId={activeCategory.id}
        categoryName={activeCategory.name}
        categorySlug={activeCategory.slug}
      />
    </SectionComponent>
  );
};

export default page;
