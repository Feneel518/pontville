
import EventsTable from "@/components/dashboard/events/EventsTable";
import { prisma } from "@/lib/prisma/db";
import { buildEventsOrderBy, buildEventsWhere } from "@/lib/searchParams/buildEventsHelper";
import { eventsSearchParamsCache } from "@/lib/searchParams/EventSearchParams";

import { FC } from "react";

interface pageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const sp = eventsSearchParamsCache.parse(await searchParams);
  const pageParams = Math.max(1, sp.page);
  const pageSizeParams = Math.min(50, Math.max(5, sp.pageSize));

  const where = buildEventsWhere(sp);
  const orderBy = buildEventsOrderBy(sp);

  const [items, total] = await Promise.all([
    prisma.event.findMany({}),
    prisma.event.count({ where }),
  ]);

  return (
    <div className="space-y-6 ">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">Manage event details.</p>
        </div>

        {/* Add button can open a dialog like customers page */}
        {/* <AddCategoryDialog /> */}
      </div>

      <EventsTable
        items={items}
        total={total}
        page={pageParams}
        pageSize={pageSizeParams}
        qp={sp}></EventsTable>
    </div>
  );
};

export default page;
