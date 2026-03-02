import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import { OrdersView } from "@/lib/actions/dashboard/orders/listOrders";
import { getBadgeVariantFromStatus } from "@/lib/helpers/BadgeSelection";
import { formatUsd } from "@/lib/helpers/formatCurrency";
import { cn } from "@/lib/utils";
import type { Order, OrderItem, OrderItemAddOn } from "@prisma/client";
import { ChevronRight, ShoppingBag } from "lucide-react";

type OrderWithItems = Order & {
  items: (OrderItem & { addOns: OrderItemAddOn[] })[];
};

function timeHHMM(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status: string) {
  // your app’s badge variants may differ; tweak freely
  if (status === "CANCELLED")
    return (
      <Badge variant="destructive" className="rounded-full">
        CANCELLED
      </Badge>
    );
  if (status === "READY")
    return (
      <Badge variant="outline" className="rounded-full">
        READY
      </Badge>
    );
  if (status === "PREPARING")
    return <Badge className="rounded-full">PREPARING</Badge>;
  if (status === "ACCEPTED")
    return <Badge className="rounded-full">ACCEPTED</Badge>;
  if (status === "COMPLETED")
    return (
      <Badge variant="secondary" className="rounded-full">
        COMPLETED
      </Badge>
    );
  return (
    <Badge variant="secondary" className="rounded-full">
      NEW
    </Badge>
  );
}

function paymentBadge(paymentStatus: string) {
  if (paymentStatus === "PAID")
    return <Badge className="rounded-full">PAID</Badge>;
  if (paymentStatus === "FAILED")
    return (
      <Badge variant="destructive" className="rounded-full">
        FAILED
      </Badge>
    );
  if (paymentStatus === "REFUNDED")
    return (
      <Badge variant="secondary" className="rounded-full">
        REFUNDED
      </Badge>
    );
  if (paymentStatus === "REQUIRES_ACTION")
    return (
      <Badge variant="outline" className="rounded-full">
        ACTION
      </Badge>
    );
  return (
    <Badge variant="secondary" className="rounded-full">
      UNPAID
    </Badge>
  );
}

function itemsPreview(items: OrderWithItems["items"]) {
  // nice compact: "2x Margherita, 1x Coke +2 more"
  const parts = items
    .slice(0, 2)
    .map(
      (i) =>
        `${i.quantity}× ${i.snapshotItemName}${i.snapshotVariantName ? ` (${i.snapshotVariantName})` : ""}`,
    );
  const more = items.length - 2;
  return { parts, more };
}

export default function OrdersList(props: {
  orders: OrderWithItems[];
  nextCursor: string | null;
  date: string;
  view: OrdersView;
  pageSize: number;
}) {
  const { orders, nextCursor, date, view, pageSize } = props;

  if (!orders.length) {
    return (
      <div className="rounded-2xl border bg-muted/20 p-10 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border bg-background">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div className="text-sm font-medium">No orders for {date}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Try switching view (Pending/Paid) or change the date.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const created = new Date(o.createdAt);
        const { parts, more } = itemsPreview(o.items);

        return (
          <Link
            key={o.id}
            href={`/dashboard/orders/${o.id}`}
            className={cn(
              "group block rounded-2xl border bg-background p-4 transition",
              "hover:bg-muted/20",
            )}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Left: key identity */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">
                    #{o.orderYear}-{String(o.orderNo).padStart(4, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeHHMM(created)}
                  </div>
                  <Badge variant={getBadgeVariantFromStatus(o.status)}>
                    {o.status}
                  </Badge>
                  <Badge variant={getBadgeVariantFromStatus(o.paymentStatus)}>
                    {o.paymentStatus}
                  </Badge>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>
                    <div className="truncate text-sm font-medium">
                      {o.customerName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {o.customerPhone}
                    </div>
                  </div>

                  <div className="min-w-0 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Items</div>
                    <div className="truncate text-sm">
                      {parts.join(", ")}
                      {more > 0 ? (
                        <span className="text-muted-foreground">
                          {" "}
                          +{more} more
                        </span>
                      ) : null}
                    </div>
                    {o.notes ? (
                      <div className="truncate text-xs text-muted-foreground">
                        Note: {o.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right: total + affordance */}
              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-base font-semibold">
                    {formatUsd(o.total)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-full opacity-0 transition group-hover:opacity-100"
                    asChild>
                    <span>
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* subtle breakdown */}
            <Separator className="my-3" />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Subtotal: {formatUsd(o.subtotal)}</span>
                <span>•</span>
                <span>Tax: {formatUsd(o.tax)}</span>
                <span>•</span>
                <span>Packing: {formatUsd(o.packingFee)}</span>
              </div>
              {o.pickupTime ? (
                <div>Pickup: {new Date(o.pickupTime).toLocaleString()}</div>
              ) : (
                <div>Pickup: —</div>
              )}
            </div>
          </Link>
        );
      })}

      {nextCursor ? (
        <div className="flex justify-center pt-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link
              href={`?date=${encodeURIComponent(date)}&view=${encodeURIComponent(
                view,
              )}&pageSize=${pageSize}&cursor=${encodeURIComponent(nextCursor)}`}
              scroll={false}>
              Load more
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
