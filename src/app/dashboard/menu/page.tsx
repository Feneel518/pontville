import MenuTable, { MenuRow } from "@/components/dashboard/menu/MenuTable";
import { listMenusAction } from "@/lib/actions/dashboard/menu/listMenusAction";
import { menuSearchParamsCache } from "@/lib/searchParams/MenuSearchParams";
import { FC } from "react";

interface pageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const sp = menuSearchParamsCache.parse(await searchParams);

  // ✅ TEMP: mock data (we'll replace with listMenusAction later)
  const items = await listMenusAction(sp);
  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Menus</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your different menus (PDF menus) shown on the
          website.
        </p>
      </div>

      <MenuTable items={items.items} page={items.page} pageSize={items.pageSize} qp={sp} total={items.total} />
    </div>
  );
};

export default page;
