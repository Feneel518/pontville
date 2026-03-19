import MenuReorderList from "@/components/dashboard/menu/MenuReorderList";
import { prisma } from "@/lib/prisma/db";

export default async function MenuReorderPage() {
  const items = await prisma.menu.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      sortOrder: true,
      updatedAt: true,
      restaurantId: true,
      imageUrl: true,
      description: true,
      categories: {
        select: {
          id: true,
          slug: true,
        },
      },
      openingHours: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Reorder Menus</h1>
        <p className="text-sm text-muted-foreground">
          Drag menus into the order you want them to appear.
        </p>
      </div>

      <MenuReorderList items={items} />
    </div>
  );
}
