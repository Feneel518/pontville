import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";

import type {
  Order,
  OrderItem,
  OrderItemAddOn,
  Restaurant,
  User,
} from "@prisma/client";
import OrderActions from "./OrderActions";
import { formatUsd } from "@/lib/helpers/formatCurrency";
import { getBadgeVariantFromStatus } from "@/lib/helpers/BadgeSelection";

type OrderWithAll = Order & {
  restaurant: Pick<Restaurant, "id" | "name" | "slug">;
  user: Pick<User, "id" | "email" | "name"> | null;
  items: (OrderItem & { addOns: OrderItemAddOn[] })[];
};

function dt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pillStatus(status: string) {
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

function pillPay(status: string) {
  if (status === "PAID") return <Badge className="rounded-full">PAID</Badge>;
  if (status === "FAILED")
    return (
      <Badge variant="destructive" className="rounded-full">
        FAILED
      </Badge>
    );
  if (status === "REQUIRES_ACTION")
    return (
      <Badge variant="outline" className="rounded-full">
        ACTION
      </Badge>
    );
  if (status === "REFUNDED")
    return (
      <Badge variant="secondary" className="rounded-full">
        REFUNDED
      </Badge>
    );
  return (
    <Badge variant="secondary" className="rounded-full">
      UNPAID
    </Badge>
  );
}

function orderLabel(o: Order) {
  return `#${o.orderYear}-${String(o.orderNo).padStart(4, "0")}`;
}

export default function OrderDetailsView({ order }: { order: OrderWithAll }) {
  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/dashboard/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            <div className="text-lg font-semibold">{orderLabel(order)}</div>
            <div className="text-sm text-muted-foreground">
              {order.restaurant.name}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm mt-4">
            <Badge variant={getBadgeVariantFromStatus(order.status)}>
              {order.status}
            </Badge>
            <Badge variant={getBadgeVariantFromStatus(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {itemsCount} items
            </Badge>
            <span className="text-muted-foreground">Created:</span>{" "}
            {dt(order.createdAt)}
          </div>
        </div>

        {/* Actions (status, payment) */}
        <OrderActions
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
        />
      </div>

      {/* Top summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatUsd(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatUsd(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packing Fee</span>
              <span className="font-medium">{formatUsd(order.packingFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatUsd(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pickup & Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <div className="text-muted-foreground">Customer</div>
              <div className="font-medium">{order.customerName}</div>
              <div className="text-muted-foreground">{order.customerPhone}</div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup time</span>
              <span className="font-medium">{dt(order.pickupTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notes</span>
              <span className="font-medium">{order.notes || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment & Stripe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium">{order.paymentStatus}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Checkout Session</span>
              <span className="font-medium truncate max-w-[170px]">
                {order.stripeCheckoutSessionId || "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Intent</span>
              <span className="font-medium truncate max-w-[170px]">
                {order.stripePaymentIntentId || "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt</span>
              {order.stripeReceiptUrl ? (
                <a
                  className="font-medium underline"
                  href={order.stripeReceiptUrl}
                  target="_blank"
                  rel="noreferrer">
                  Open
                </a>
              ) : (
                <span className="font-medium">—</span>
              )}
            </div>

            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth user</span>
              <span className="font-medium">
                {order.user?.email || "Guest"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((it) => {
            const addOnsTotalPerUnit = it.addOns.reduce(
              (a, x) => a + (x.price ?? 0),
              0,
            );
            return (
              <div key={it.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">
                        {it.quantity}× {it.snapshotItemName}
                        {it.snapshotVariantName ? (
                          <span className="text-muted-foreground">
                            {" "}
                            ({it.snapshotVariantName})
                          </span>
                        ) : null}
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {it.snapshotCategoryName}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        Menu: {it.snapshotMenuName}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Unit base: {formatUsd(it.unitBasePrice)} • Add-ons/unit:{" "}
                      {formatUsd(addOnsTotalPerUnit)} • Unit total:{" "}
                      <span className="font-medium">
                        {formatUsd(it.unitTotalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Line total
                    </div>
                    <div className="text-base font-semibold">
                      {formatUsd(it.lineTotal)}
                    </div>
                  </div>
                </div>

                {it.addOns.length ? (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm font-medium mb-2">Add-ons</div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {it.addOns.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-xl border bg-muted/20 p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                {a.snapshotGroupName}
                              </div>
                              <div className="truncate font-medium">
                                {a.snapshotAddOnName}
                              </div>
                            </div>
                            <div className="font-semibold">
                              {formatUsd(a.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Timeline (simple, deterministic from status) */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Kitchen Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          {["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED"].map((s) => {
            const active = s === order.status;
            const reached =
              ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED"].indexOf(
                s,
              ) <=
              ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED"].indexOf(
                order.status,
              );

            return (
              <div
                key={s}
                className={[
                  "rounded-2xl border p-3",
                  active ? "bg-primary/30" : "",
                ].join(" ")}>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={reached ? "h-4 w-4" : "h-4 w-4 opacity-30"}
                  />
                  <div className="text-sm font-medium">{s}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {active ? "Current status" : reached ? "Reached" : "Pending"}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
