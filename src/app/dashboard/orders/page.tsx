import { requireUser } from "@/lib/checks/requireUser";

import OrdersToolbar from "@/components/dashboard/orders/OrdersToolbar";

import OrdersList from "@/components/dashboard/orders/OrdersTable";
import { Card, CardContent } from "@/components/ui/card";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import {
  listOrdersForDate,
  OrdersView,
} from "@/lib/actions/dashboard/orders/listOrders";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type SP = {
  date?: string;
  view?: OrdersView;
  cursor?: string;
  pageSize?: string;
  q?: string;
  status?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const session = await requireUser("orders");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const sp = (await searchParams) ?? {};
  const date = sp.date ?? todayISO();
  const view: OrdersView = sp.view ?? "pending";
  const cursor = sp.cursor || undefined;
  const pageSize = Math.min(Math.max(Number(sp.pageSize ?? 30) || 30, 10), 100);

  const res = await listOrdersForDate({
    restaurantId,
    dateStr: date,
    view,
    pageSize,
    cursor,
  });

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <div className="text-2xl">Orders</div>
        <Link
          href={"/dashboard/orders/pos"}
          className={buttonVariants({ variant: "link" })}>
          Go to Order POS <ArrowRight></ArrowRight>
        </Link>
      </div>

      <OrdersToolbar
        date={date}
        view={view}
        pendingCount={res.pendingCount}
        paidCount={res.paidCount}
        revenuePaid={res.revenuePaid}
      />

      <Card className="rounded-2xl">
        <CardContent className="p-3 md:p-4">
          <OrdersList
            orders={res.orders as any}
            nextCursor={res.nextCursor}
            date={date}
            view={view}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
