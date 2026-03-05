"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { BookingsView } from "@/lib/actions/dashboard/bookings/listBookings";

function setParam(sp: URLSearchParams, key: string, value?: string) {
  const next = new URLSearchParams(sp);
  if (!value) next.delete(key);
  else next.set(key, value);
  next.delete("cursor");
  return next;
}

export default function BookingsToolbar(props: {
  date: string;
  view: BookingsView;
  q: string;
  acceptedCount: number;
  cancelledCount: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const selectedDate = React.useMemo(
    () => new Date(`${props.date}T00:00:00`),
    [props.date],
  );
  const push = (next: URLSearchParams) =>
    router.replace(`?${next.toString()}`, { scroll: false });

  const onSelectDate = (d?: Date) => {
    if (!d) return;
    push(setParam(sp, "date", format(d, "yyyy-MM-dd")));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={props.view === "accepted" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "accepted"))}>
            Accepted
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                props.view === "accepted" && "bg-background/20",
              )}>
              {props.acceptedCount}
            </Badge>
          </Button>

          <Button
            variant={props.view === "cancelled" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "cancelled"))}>
            Cancelled
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                props.view === "cancelled" && "bg-background/20",
              )}>
              {props.cancelledCount}
            </Badge>
          </Button>

          <Button
            variant={props.view === "all" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "all"))}>
            All
          </Button>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            className="md:w-60 rounded-xl"
            placeholder="Search name / phone / email"
            defaultValue={props.q}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const val = (e.target as HTMLInputElement).value.trim();
              push(setParam(sp, "q", val || undefined));
            }}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[220px] justify-start text-left font-normal rounded-xl",
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
    </div>
  );
}
