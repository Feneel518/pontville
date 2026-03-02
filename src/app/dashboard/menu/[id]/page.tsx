import { CategoriesNav } from "@/components/dashboard/menu/CategoriesNav";
import { getMenuBasedOnId } from "@/lib/actions/dashboard/menu/getMenuBasedOnId";

import { SettingsShell } from "@/components/dashboard/settings/SettingShell";
import { getMenuItemsBasedOnCategorySlug } from "@/lib/actions/dashboard/menu/category/getMenuItemsBasedOnCategorySlug";
import { Section } from "@/lib/types/settingsSection";
import { redirect } from "next/navigation";
import { FC } from "react";
import MenuItemToolbar from "@/components/dashboard/menu/menuItem/MenuItemToolbar";
import { menuItemSearchParamsCache } from "@/lib/searchParams/MenuItemSearchParams";
import MenuItemDisplay from "@/lib/actions/dashboard/menu/menuItem/MenuItemDisplay";
import { listMenuItemsAction } from "@/lib/actions/dashboard/menu/menuItem/listMenusItemAction";
import { prisma } from "@/lib/prisma/db";

interface pageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ id: string }>;
}

const page: FC<pageProps> = async ({ searchParams, params }) => {
  const sp = (await searchParams) ?? {};
  const { id: menuId } = await params;

  // Load menu
  const menuRes = await getMenuBasedOnId(menuId);
  if (!menuRes.ok || !menuRes.menu) redirect("/dashboard/menu");

  const menu = menuRes.menu;

  // Pick active category slug
  const requestedSection = sp.section as Section | undefined;
  const fallbackSlug = menu.categories[0]?.slug ?? "";
  const activeCategorySlug = requestedSection ?? fallbackSlug;

  // If menu has no categories at all
  if (!activeCategorySlug) {
    return (
      <SettingsShell
        title={menu.name}
        subtitle={menu.description ?? ""}
        nav={
          <CategoriesNav
            active=""
            menuId={menuId}
            categories={menu.categories}
          />
        }>
        <div className="text-sm text-muted-foreground">
          No categories found. Create a category to add menu items.
        </div>
      </SettingsShell>
    );
  }
  // 3) Resolve categoryId (avoid non-null assertions)
  const category = await prisma.category.findUnique({
    where: { slug: activeCategorySlug },
    select: { id: true },
  });

  if (!category) {
    // slug in URL not found (maybe deleted) → fallback to first category
    const safeSlug = fallbackSlug;
    if (!safeSlug) redirect("/dashboard/menu");

    const safeCategory = await prisma.category.findUnique({
      where: { slug: safeSlug },
      select: { id: true },
    });

    if (!safeCategory) redirect("/dashboard/menu");

    redirect(`/dashboard/menu/${menuId}?section=${safeSlug}`);
  }

  // 4) Query params & list items
  const qp = menuItemSearchParamsCache.parse(sp);
  const itemsRes = await listMenuItemsAction(qp, activeCategorySlug);

  return (
    <SettingsShell
      title={menu.name}
      subtitle={menu.description ?? ""}
      nav={
        <CategoriesNav
          active={activeCategorySlug}
          menuId={menuId}
          categories={menu.categories}
        />
      }>
      <div className="flex flex-col gap-4">
        <MenuItemToolbar
          total={itemsRes.total}
          pageParams={itemsRes.page}
          pageSizeParams={itemsRes.pageSize}
          qp={qp}
          categoryId={category.id}
        />

        {itemsRes.items.length > 0 ? (
          <MenuItemDisplay
            menuItems={itemsRes.items}
            categoryId={category.id}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            No menu items found.
          </div>
        )}
      </div>
    </SettingsShell>
  );
};

export default page;
