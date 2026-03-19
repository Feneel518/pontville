import FullMenuItemCardFrontend from "@/components/frontend/Menu/FullMenuItemCardFrontend";
import FullMenuSearchBar from "@/components/frontend/Menu/FullMenuSearchBar";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { getMenuAvailabilityNew } from "@/lib/menuChecks/menuAvailability";
import { prisma } from "@/lib/prisma/db";
import { unstable_cache } from "next/cache";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

const getAllPublicMenuItems = unstable_cache(
  async () => {
    return prisma.menuItem.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        isAvailable: true,
        category: {
          deletedAt: null,
          status: "ACTIVE",
          menu: {
            deletedAt: null,
            status: "ACTIVE",
          },
        },
      },
      include: {
        addOnGroups: {
          include: {
            addOns: true,
          },
        },
        variants: true,
        category: {
          include: {
            menu: {
              include: {
                openingHours: true,
              },
            },
          },
        },
      },
      orderBy: [
        { category: { menu: { name: "asc" } } },
        { category: { name: "asc" } },
        { name: "asc" },
      ],
    });
  },
  ["public-all-menu-items-searchable"],
  {
    revalidate: 60,
    tags: ["menu-items", "menus", "categories"],
  },
);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreItem(item: any, query: string) {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(item.name ?? "");
  const desc = normalize(item.description ?? "");
  const category = normalize(item.category?.name ?? "");
  const menu = normalize(item.category?.menu?.name ?? "");
  const variants = (item.variants ?? []).map((v: any) =>
    normalize(v.name ?? ""),
  );
  const addOns = (item.addOnGroups ?? [])
    .flatMap((g: any) => g.addOns ?? [])
    .map((a: any) => normalize(a.name ?? ""));

  let score = 0;

  if (name === q) score += 100;
  if (name.startsWith(q)) score += 60;
  if (name.includes(q)) score += 40;

  if (category.includes(q)) score += 18;
  if (menu.includes(q)) score += 14;
  if (desc.includes(q)) score += 10;

  if (variants.some((v: string) => v === q)) score += 25;
  if (variants.some((v: string) => v.includes(q))) score += 14;

  if (addOns.some((a: string) => a === q)) score += 16;
  if (addOns.some((a: string) => a.includes(q))) score += 8;

  // token-based loose match
  const qWords = q.split(/\s+/).filter(Boolean);
  for (const word of qWords) {
    if (name.includes(word)) score += 10;
    if (desc.includes(word)) score += 3;
    if (category.includes(word)) score += 4;
    if (menu.includes(word)) score += 3;
  }

  return score;
}

export default async function FullMenuPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim() ?? "";

  const items = await getAllPublicMenuItems();

  const ranked =
    q.length > 0
      ? items
          .map((item) => ({
            item,
            score: scoreItem(item, q),
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
      : items.map((item) => ({ item, score: 0 }));

  const resultItems = ranked.map((x) => x.item);

  const grouped = Object.values(
    resultItems.reduce<
      Record<
        string,
        {
          menuId: string;
          menuName: string;
          categories: Record<
            string,
            {
              categoryId: string;
              categoryName: string;
              items: typeof resultItems;
            }
          >;
        }
      >
    >((acc, item) => {
      const menu = item.category.menu;
      const category = item.category;

      if (!acc[menu.id]) {
        acc[menu.id] = {
          menuId: menu.id,
          menuName: menu.name,
          categories: {},
        };
      }

      if (!acc[menu.id].categories[category.id]) {
        acc[menu.id].categories[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          items: [],
        };
      }

      acc[menu.id].categories[category.id].items.push(item);
      return acc;
    }, {}),
  );

  return (
    <SectionComponent>
      <div className="space-y-8">
        <div className="space-y-4">
          <Heading label="Full Menu" />
          <FullMenuSearchBar />
          <p className="text-sm text-muted-foreground">
            {q
              ? `${resultItems.length} result${resultItems.length === 1 ? "" : "s"} for “${q}”`
              : `${items.length} item${items.length === 1 ? "" : "s"} available`}
          </p>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            No items found for “{q}”.
          </div>
        ) : (
          grouped.map((menuGroup) => (
            <section key={menuGroup.menuId} className="space-y-8">
              <div>
                <h2 className="text-3xl font-serif">{menuGroup.menuName}</h2>
              </div>

              {Object.values(menuGroup.categories).map((categoryGroup) => (
                <div key={categoryGroup.categoryId} className="space-y-4">
                  <h3 className="text-xl font-medium text-muted-foreground">
                    {categoryGroup.categoryName}
                  </h3>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryGroup.items.map((item) => (
                      <FullMenuItemCardFrontend
                        key={item.id}
                        item={item}
                        showMeta
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </SectionComponent>
  );
}
