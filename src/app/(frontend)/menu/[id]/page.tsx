import MenuCategoriesPublicToolbar from "@/components/frontend/Menu/MenuCategoriesPublicToolbar";
import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { getMenuById } from "@/lib/actions/frontend/menu/getMenuById";
import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";
import { pageMetadata } from "@/lib/helpers/seo";
import { prisma } from "@/lib/prisma/db";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

import { FC } from "react";

const getMenuByIdCached = unstable_cache(
  async (id: string) => getMenuById(id),
  // @ts-ignore
  (id) => [`menu-public:${id}`],
  { revalidate: 60 }, // adjust (seconds)
);

interface pageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { name: true, slug: true, description: true, updatedAt: true },
  });

  if (!category)
    return pageMetadata({ title: "Menu", description: "Menu", path: "/menu" });

  const title = category.name;
  const description =
    category.description?.trim() ||
    `Explore ${category.name} at The Pontville Pub — Pontville, Tasmania.`;

  return pageMetadata({
    title,
    description,
    path: `/menu/${category.slug}`,
    // Optional OG per category (if you have images)
    // image: `/og?type=menu&title=${encodeURIComponent(title)}`
  });
}

const page: FC<pageProps> = async ({ params, searchParams }) => {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const menuFetch = await getMenuByIdCached(id);

  if (!menuFetch.ok || !menuFetch.menu) {
    redirect("/");
  }

  const menu = menuFetch.menu;

  const categories = menuFetch.categories;
  if (!categories || !categories.length)
    return <Heading label="No Categories found" />;

  const requestedSlug =
    typeof sp.category === "string" ? sp.category : undefined;
  const activeSlug = requestedSlug ?? categories[0].slug;
  const activeCategory =
    categories.find((c) => c.slug === activeSlug) ?? categories[0];

  console.log(menu.openingHours);

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

// export default async function Page({ params }: { params: { id: string } }) {
//   return <div>Menu {params.id}</div>;
// }
