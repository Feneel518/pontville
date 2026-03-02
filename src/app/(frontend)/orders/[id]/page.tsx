import { notFound } from "next/navigation";
import { requireUser } from "@/lib/checks/requireUser";
import { prisma } from "@/lib/prisma/db";
import SectionComponent from "@/components/global/SectionComponent";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { formatUsd } from "@/lib/helpers/formatCurrency";

interface PageProps {
  params: Promise<{ id: string }>;
}

function statusVariant(status: string) {
  switch (status) {
    case "NEW":
      return "secondary";
    case "ACCEPTED":
    case "PREPARING":
      return "default";
    case "READY":
      return "secondary";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

function paymentVariant(status: string) {
  switch (status) {
    case "PAID":
      return "default";
    case "FAILED":
      return "destructive";
    case "REFUNDED":
      return "outline";
    default:
      return "secondary";
  }
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const session = await requireUser("orders");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: { name: true },
      },
      items: {
        include: {
          addOns: true,
        },
      },
    },
  });

  if (!order) notFound();

  // 🔒 Ownership check
  if (order.userId !== session.user.id) {
    notFound();
  }

  return (
    <SectionComponent className="max-w-3xl mx-auto">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Order #{order.orderNo}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <Badge
              variant={statusVariant(order.status)}
              className="rounded-full">
              {order.status}
            </Badge>

            <Badge
              variant={paymentVariant(order.paymentStatus)}
              className="rounded-full">
              {order.paymentStatus}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restaurant</span>
              <span>{order.restaurant?.name ?? "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span>{order.customerName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup Time</span>
              <span>
                {order.pickupTime
                  ? new Date(order.pickupTime).toLocaleString()
                  : "ASAP"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>
                    {item.snapshotItemName}
                    {item.snapshotVariantName
                      ? ` (${item.snapshotVariantName})`
                      : ""}
                    {" × "}
                    {item.quantity}
                  </span>
                  <span>{formatUsd(item.lineTotal)}</span>
                </div>

                {item.addOns.length > 0 && (
                  <div className="ml-4 text-xs text-muted-foreground space-y-1">
                    {item.addOns.map((a) => (
                      <div key={a.id}>
                        + {a.snapshotAddOnName} ({formatUsd(a.price)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatUsd(order.subtotal)}</span>
            </div>

            {order.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatUsd(order.tax)}</span>
              </div>
            )}

            {order.packingFee > 0 && (
              <div className="flex justify-between">
                <span>Packing</span>
                <span>{formatUsd(order.packingFee)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatUsd(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/orders">Back to Orders</Link>
            </Button>

            {order.paymentStatus !== "PAID" && (
              <Button asChild className="rounded-xl">
                <Link href="/checkout">Retry Payment</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </SectionComponent>
  );
}
