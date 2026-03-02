import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { formatUsd } from "@/lib/helpers/formatCurrency";

type OrdersGridProps = {
  orders: Array<{
    id: string;
    orderNo: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    total: number; // cents
    customerName: string;
    pickupTime: Date | null;
    restaurant: { name: string; slug: string };
    items: Array<{
      id: string;
      quantity: number;
      snapshotItemName: string;
      snapshotVariantName: string | null;
      lineTotal: number;
    }>;
  }>;
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

function badgeVariantForPayment(ps: PaymentStatus) {
  if (ps === "PAID") return "success";
  if (ps === "FAILED") return "destructive";
  if (ps === "REFUNDED") return "outline";
  if (ps === "REQUIRES_ACTION") return "outline";
  return "default"; // UNPAID
}

function badgeVariantForStatus(s: OrderStatus) {
  if (s === "COMPLETED") return "secondary";
  if (s === "CANCELLED") return "destructive";
  if (s === "READY") return "outline";
  return "default";
}

export default function OrdersGrid({ orders }: OrdersGridProps) {
  if (!orders.length) {
    return (
      <div className="rounded-2xl border p-10 text-center text-muted-foreground">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((o) => {
        const itemCount = o.items.reduce(
          (acc, it) => acc + (it.quantity ?? 1),
          0,
        );

        const topItems = o.items.slice(0, 3).map((it) => {
          const v = it.snapshotVariantName
            ? ` (${it.snapshotVariantName})`
            : "";
          return `${it.snapshotItemName}${v} ×${it.quantity}`;
        });

        return (
          <Card key={o.id} className="rounded-2xl group">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Badge variant={badgeVariantForStatus(o.status) as any}>
                  {o.status}
                </Badge>

                <Badge variant={badgeVariantForPayment(o.paymentStatus) as any}>
                  {o.paymentStatus}
                </Badge>
              </div>

              <CardTitle className="text-xl">
                Order #{String(o.orderNo).padStart(4, "0")}
              </CardTitle>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary/80" />
                  <span>{formatDate(o.createdAt)}</span>
                  <span className="opacity-60">•</span>
                  <span>{o.restaurant.name}</span>
                </div>

                {o.pickupTime ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/80" />
                    <span>Pickup: {formatTime(o.pickupTime)}</span>
                  </div>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  {itemCount} items • {o.customerName}
                </span>
                <span className="font-semibold">{formatUsd(o.total)}</span>
              </div>

              <div className={cn("space-y-1 text-sm text-muted-foreground")}>
                {topItems.map((t, idx) => (
                  <div key={idx} className="line-clamp-1">
                    • {t}
                  </div>
                ))}
                {o.items.length > 3 ? (
                  <div className="text-xs text-muted-foreground/80">
                    +{o.items.length - 3} more items
                  </div>
                ) : null}
              </div>

              <Button asChild className="w-full" variant="elegant">
                <Link href={`/orders/${o.id}`}>View Order</Link>
              </Button>

              <Button asChild className="w-full" variant="outline">
                <Link href="/menu">Continue Ordering</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
