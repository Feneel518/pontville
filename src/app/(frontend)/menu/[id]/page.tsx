// import MenuCategoriesPublicToolbar from "@/components/frontend/Menu/MenuCategoriesPublicToolbar";
// import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
// import MenuItemsSectionLive from "@/components/frontend/Menu/MenuItemsSectionLive";
// import Heading from "@/components/global/Heading";
// import SectionComponent from "@/components/global/SectionComponent";
// import { getMenuById } from "@/lib/actions/frontend/menu/getMenuById";
// import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";
// import { pageMetadata } from "@/lib/helpers/seo";
// import { prisma } from "@/lib/prisma/db";
// import { Metadata } from "next";
// import { unstable_cache } from "next/cache";
// import { redirect } from "next/navigation";

// import { FC } from "react";

// interface pageProps {
//   params: Promise<{
//     id: string;
//   }>;
//   searchParams?: Promise<Record<string, string | string[] | undefined>>;
// }

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// const page: FC<pageProps> = async ({ params, searchParams }) => {
//   const { id } = await params;
//   const sp = (await searchParams) ?? {};

//   const menuFetch = await getMenuById(id);

//   if (!menuFetch.ok || !menuFetch.menu) {
//     redirect("/");
//   }

//   const menu = menuFetch.menu;

//   const categories = menuFetch.categories;

//   if (!categories || !categories.length)
//     return <Heading label="No Categories found" />;

//   const requestedSlug =
//     typeof sp.category === "string" ? sp.category : undefined;

//   const activeSlug = requestedSlug ?? categories[0].slug;
//   const activeCategory =
//     categories.find((c) => c.slug === activeSlug) ?? categories[0];

//   const initialOpen = isMenuOpenNow({
//     openingHours: menu.openingHours,
//     now: new Date(),
//   });

//   return (
//     <SectionComponent>
//       <MenuCategoriesPublicToolbar
//         categories={categories}
//         selected={activeCategory?.id}></MenuCategoriesPublicToolbar>

//       {/* streams separately, keeps page responsive */}
//       <MenuItemsSection
//         open={initialOpen}
//         menuId={id}
//         categoryId={activeCategory.id}
//         categoryName={activeCategory.name}
//         categorySlug={activeCategory.slug}
//       />
//     </SectionComponent>
//   );
// };

// export default page;

// // export default async function Page({ params }: { params: { id: string } }) {
// //   return <div>Menu {params.id}</div>;
// // }
import { getMenuAvailability } from "@/components/frontend/Menu/MenuAvailability";
import MenuCategoriesPublicToolbar from "@/components/frontend/Menu/MenuCategoriesPublicToolbar";
import MenuItemsSectionLive from "@/components/frontend/Menu/MenuItemsSectionLive";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { getMenuById } from "@/lib/actions/frontend/menu/getMenuById";
import { getMenuAvailabilityNew } from "@/lib/menuChecks/menuAvailability";

import { prisma } from "@/lib/prisma/db";
import { redirect } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Page: FC<PageProps> = async ({ params, searchParams }) => {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const menu = await prisma.menu.findUnique({
    where: { slug: id, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      openingHours: {
        select: {
          day: true,
          isClosed: true,
          openTime: true,
          closeTime: true,
        },
      },
      categories: {
        where: { deletedAt: null, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!menu) {
    redirect("/");
  }

  const categories = menu.categories;
  if (!categories || !categories.length) {
    return <Heading label="No Categories found" />;
  }

  const requestedSlug =
    typeof sp.category === "string" ? sp.category : undefined;

  const activeCategory =
    categories.find((c) => c.slug === requestedSlug) ?? categories[0];

  const availabiltiy = getMenuAvailabilityNew(
    menu.openingHours,
    "Australia/Hobart",
  );

  return (
    <SectionComponent>
      <MenuCategoriesPublicToolbar
        categories={categories}
        selected={activeCategory.id}
      />

      <MenuItemsSectionLive
        menuId={menu.id}
        categoryId={activeCategory.id}
        categoryName={activeCategory.name}
        categorySlug={activeCategory.slug}
        initialOpen={availabiltiy}
        openingHours={menu.openingHours}
        timezone={"Australia/Hobart"}
      />
    </SectionComponent>
  );
};

export default Page;
