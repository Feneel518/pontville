import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Receipt, Phone, Store } from "lucide-react";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { formatUsd } from "@/lib/helpers/formatCurrency";

type OrderDetailsViewProps = {
  order: {
    id: string;
    orderNo: number;
    orderKey: string | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;

    customerName: string;
    customerPhone: string;
    pickupTime: Date | null;
    notes: string | null;

    subtotal: number;
    tax: number;
    packingFee: number;
    total: number;

    stripeReceiptUrl: string | null;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId: string | null;

    restaurant: {
      id: string;
      name: string;
      slug: string;
      phone: string | null;
      addressLine: string | null;
    };

    items: Array<{
      id: string;
      quantity: number;

      snapshotCategoryName: string;
      snapshotItemName: string;
      snapshotVariantName: string | null;
      snapshotMenuId: string | null;

      unitBasePrice: number;
      unitAddOnsPrice: number;
      unitTotalPrice: number;
      lineTotal: number;

      addOns: Array<{
        id: string;
        snapshotGroupName: string;
        snapshotAddOnName: string;
        price: number;
      }>;
    }>;
  };
};

function dateLabel(d: Date) {
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeLabel(d: Date) {
  return d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

function statusVariant(s: OrderStatus) {
  if (s === "COMPLETED") return "secondary";
  if (s === "CANCELLED") return "destructive";
  if (s === "READY") return "outline";
  return "default";
}

function payVariant(p: PaymentStatus) {
  if (p === "PAID") return "secondary";
  if (p === "FAILED") return "destructive";
  if (p === "REFUNDED") return "outline";
  if (p === "REQUIRES_ACTION") return "outline";
  return "default";
}

export default function OrderDetailsView({ order }: OrderDetailsViewProps) {
  const orderLabel = `#${String(order.orderNo).padStart(4, "0")}`;
  const itemsCount = order.items.reduce(
    (acc, it) => acc + (it.quantity ?? 1),
    0,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* LEFT: Items */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(order.status) as any}>
                  {order.status}
                </Badge>
                <Badge variant={payVariant(order.paymentStatus) as any}>
                  {order.paymentStatus}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                {itemsCount} items • Total{" "}
                <span className="font-semibold text-foreground">
                  {formatUsd(order.total)}
                </span>
              </div>
            </div>

            <CardTitle className="text-xl">
              Order Summary {orderLabel}
            </CardTitle>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary/80" />
                <span>{dateLabel(order.createdAt)}</span>
              </div>

              {order.pickupTime ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/80" />
                  <span>Pickup: {timeLabel(order.pickupTime)}</span>
                </div>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />

            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/menu/${it.snapshotMenuId}?category=${it.snapshotCategoryName}`}
                        className="text-sm font-medium">
                        {it.snapshotItemName}
                        {it.snapshotVariantName ? (
                          <span className="text-muted-foreground">
                            {" "}
                            • {it.snapshotVariantName}
                          </span>
                        ) : null}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {it.snapshotCategoryName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatUsd(it.lineTotal)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {it.quantity} × {formatUsd(it.unitTotalPrice)}
                      </div>
                    </div>
                  </div>

                  {it.addOns.length ? (
                    <div className="mt-3 space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Add-ons
                      </div>
                      {it.addOns.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {a.snapshotGroupName}: {a.snapshotAddOnName}
                          </span>
                          <span className="text-muted-foreground">
                            + {formatUsd(a.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {order.notes ? (
              <>
                <Separator />
                <div className="rounded-xl border bg-card px-3 py-2 text-sm">
                  <span className="font-medium">Notes:</span>{" "}
                  <span className="text-muted-foreground">{order.notes}</span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Customer + totals + actions */}
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{order.customerName}</div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </div>
              <div className="font-medium">{order.customerPhone}</div>
            </div>

            <Separator />

            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" /> Restaurant
              </div>
              <div className="text-right font-medium">
                {order.restaurant.name}
              </div>
            </div>

            {order.restaurant.phone ? (
              <div className="flex items-start justify-between gap-3">
                <div className="text-muted-foreground">Contact</div>
                <div className="font-medium">{order.restaurant.phone}</div>
              </div>
            ) : null}

            {order.restaurant.addressLine ? (
              <div className="text-xs text-muted-foreground">
                {order.restaurant.addressLine}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatUsd(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatUsd(order.tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Packing</span>
              <span className="font-medium">{formatUsd(order.packingFee)}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatUsd(order.total)}</span>
            </div>

            {order.stripeReceiptUrl ? (
              <Button asChild variant="outline" className="w-full mt-2">
                <a
                  href={order.stripeReceiptUrl}
                  target="_blank"
                  rel="noreferrer">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="elegant">
              <Link href="/menu">Continue Ordering</Link>
            </Button>

            <Button asChild className="w-full" variant="outline">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {order.stripeCheckoutSessionId || order.stripePaymentIntentId ? (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {order.orderKey ? <div>Order Key: {order.orderKey}</div> : null}
              {order.stripeCheckoutSessionId ? (
                <div>Checkout Session: {order.stripeCheckoutSessionId}</div>
              ) : null}
              {order.stripePaymentIntentId ? (
                <div>Payment Intent: {order.stripePaymentIntentId}</div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
