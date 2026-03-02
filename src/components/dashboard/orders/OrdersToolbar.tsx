"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrdersView } from "@/lib/actions/dashboard/orders/listOrders";
import { formatUsd } from "@/lib/helpers/formatCurrency";

function setParam(sp: URLSearchParams, key: string, value?: string) {
  const next = new URLSearchParams(sp);
  if (!value) next.delete(key);
  else next.set(key, value);
  next.delete("cursor"); // reset pagination
  return next;
}

function money(vCents: number) {
  const v = (vCents ?? 0) / 100;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function OrdersToolbar(props: {
  date: string; // YYYY-MM-DD
  view: OrdersView;
  pendingCount: number;
  paidCount: number;
  revenuePaid: number;
}) {
  const { date, view, pendingCount, paidCount, revenuePaid } = props;

  const router = useRouter();
  const sp = useSearchParams();

  const selectedDate = React.useMemo(() => {
    return new Date(`${date}T00:00:00`);
  }, [date]);

  const push = (next: URLSearchParams) =>
    router.replace(`?${next.toString()}`, { scroll: false });

  const onSelectDate = (d?: Date) => {
    if (!d) return;
    const iso = format(d, "yyyy-MM-dd");
    push(setParam(sp, "date", iso));
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {/* <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Pending</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-semibold">{pendingCount}</div>
            <Badge variant="secondary" className="rounded-full">
              Kitchen
            </Badge>
          </div>
        </Card>

        <Card className="rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Paid</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-semibold">{paidCount}</div>
            <Badge variant="secondary" className="rounded-full">
              Settled
            </Badge>
          </div>
        </Card>

        <Card className="rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatUsd(revenuePaid)}
          </div>
        </Card>
      </div> */}

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
        {/* View Switch */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={view === "pending" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "pending"))}>
            Pending
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                view === "pending" && "bg-background/20",
              )}>
              {pendingCount}
            </Badge>
          </Button>

          <Button
            variant={view === "paid" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "paid"))}>
            Paid
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                view === "paid" && "bg-background/20",
              )}>
              {paidCount}
            </Badge>
          </Button>

          <Button
            variant={view === "all" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "all"))}>
            All
          </Button>
        </div>

        {/* ShadCN Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[220px] justify-start text-left font-normal rounded-xl",
                !selectedDate && "text-muted-foreground",
              )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
