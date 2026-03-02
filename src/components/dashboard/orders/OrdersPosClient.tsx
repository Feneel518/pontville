"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/lib/store/orders.store";
import { updateOrderStatusAction } from "@/lib/actions/dashboard/orders/updateOrderStatusAction";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { getBadgeVariantFromStatus } from "@/lib/helpers/BadgeSelection";
// import { useOrdersStore } from "@/lib/store/orders.store";
// import { useOrdersRealtime } from "@/lib/realtime/useOrdersRealtime";
// import { updateOrderStatusAction } from "@/lib/actions/orders/updateOrderStatusAction";

type Order = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        menuItem: { select: { name: true } };
        itemVariant: { select: { name: true } };
      };
    };
  };
}>; // you can replace with Prisma type

export default function OrdersPosClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialOrders?.[0]?.id ?? null,
  );

  const { orders, setOrders, upsertOrder } = useOrdersStore();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders, setOrders]);

  // realtime updates from kitchen / other POS screens
  //   useOrdersRealtime({
  //     onUpdated: (order) => upsertOrder(order),
  //     onCreated: (order) => upsertOrder(order),
  //   });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => {
      const no = String(o.orderNo ?? "").includes(s);
      const id = String(o.id ?? "").includes(s);
      return no || id;
    });
  }, [orders, q]);

  const selected = useMemo(
    () => filtered.find((o) => o.id === selectedId) ?? filtered[0],
    [filtered, selectedId],
  );

  async function setStatus(orderId: string, status: any) {
    // optimistic update
    upsertOrder({ id: orderId, status });
    await updateOrderStatusAction({ orderId, status });
  }

  return (
    <div className="grid h-[calc(100vh-80px)] grid-cols-12 gap-4">
      {/* LEFT: queue */}
      <div className="col-span-5 rounded-2xl border bg-background p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-lg font-semibold">Orders (POS)</div>
          <Badge variant="info" className="rounded-full">
            {filtered.length} active
          </Badge>
        </div>

        <Input
          placeholder="Search by order no / id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-3"
        />

        <div className="h-[calc(100%-92px)] space-y-2 overflow-auto pr-1">
          {filtered.map((o) => {
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition hover:bg-muted/40",
                  selected?.id === o.id && "border-primary bg-muted/30",
                )}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    #{o.orderNo ?? o.id.slice(0, 6)}
                  </div>
                  <Badge
                    variant={getBadgeVariantFromStatus(o.status)}
                    className="rounded-full">
                    {o.status}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {o.items?.slice(0, 3).map((it, idx) => {
                    const name = `${it.snapshotItemName} ${it.snapshotVariantName ? `- ${it.snapshotVariantName}` : ""}`;
                    return (
                      <span key={idx}>
                        {it.quantity} x {name}
                        {idx < Math.min(o.items.length, 3) - 1 ? "," : ""}
                      </span>
                    );
                  })}
                  {o.items?.length > 3 ? "…" : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: details */}
      <div className="col-span-7 rounded-2xl border bg-background p-4">
        {!selected ? (
          <div className="text-sm text-muted-foreground">No orders.</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">
                  Order #{selected.orderNo ?? selected.id.slice(0, 6)}
                </div>
                <div className="text-xl font-semibold">
                  {selected.customerName} - {selected.customerPhone}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Created {new Date(selected.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Takeaway Time -{" "}
                  {selected.pickupTime
                    ? format(selected.pickupTime, "hh:mm a")
                    : "ASAP"}
                </div>
              </div>

              <Badge className="rounded-full text-sm">{selected.status}</Badge>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="text-sm font-medium">Items</div>
              <div className="space-y-2">
                {selected.items?.map((it) => {
                  const name = `${it.snapshotItemName} ${it.snapshotVariantName ? `- ${it.snapshotVariantName}` : ""}`;
                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between rounded-xl border p-3">
                      <div className="text-sm">
                        {name} - {it.snapshotCategoryName} -{" "}
                        {it.snapshotMenuName}
                      </div>
                      <div className="text-sm font-semibold">
                        × {it.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selected.notes ? (
              <>
                <Separator className="my-4" />
                <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                  <div className="mb-1 font-medium">Notes</div>
                  <div className="text-muted-foreground">{selected.notes}</div>
                </div>
              </>
            ) : null}

            <Separator className="my-4" />

            {/* POS big actions */}
            <div
              className={`grid grid-cols-2 gap-3 ${selected.paymentStatus !== "PAID" ? "hidden" : ""}`}>
              <Button
                size="lg"
                variant={"outline"}
                onClick={() => setStatus(selected.id, "ACCEPTED")}
                disabled={selected.status === "ACCEPTED"}>
                Accept
              </Button>
              <Button
                size="lg"
                variant={"outline"}
                onClick={() => setStatus(selected.id, "PREPARING")}
                disabled={selected.status === "PREPARING"}>
                Preparing
              </Button>
              <Button
                size="lg"
                variant={"outline"}
                onClick={() => setStatus(selected.id, "READY")}
                disabled={selected.status === "READY"}>
                Ready
              </Button>
              <Button
                size="lg"
                variant={"outline"}
                onClick={() => setStatus(selected.id, "CANCELLED")}>
                Cancel
              </Button>
            </div>

            <div className="mt-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStatus(selected.id, "COMPLETED")}>
                Complete
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
