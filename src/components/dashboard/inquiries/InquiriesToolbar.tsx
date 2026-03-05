"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InquiriesView } from "@/lib/actions/dashboard/inquiries/listInquiriesAction";

function setParam(sp: URLSearchParams, key: string, value?: string) {
  const next = new URLSearchParams(sp);
  if (!value) next.delete(key);
  else next.set(key, value);
  next.delete("cursor"); // reset pagination
  return next;
}

export default function InquiriesToolbar(props: {
  date: string; // YYYY-MM-DD
  view: InquiriesView;
  q: string;
  type: string; // "" | TABLE | EVENT
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}) {
  const { date, view, q, type, pendingCount, acceptedCount, rejectedCount } =
    props;

  const router = useRouter();
  const sp = useSearchParams();

  const selectedDate = React.useMemo(
    () => new Date(`${date}T00:00:00`),
    [date],
  );

  const push = (next: URLSearchParams) =>
    router.replace(`?${next.toString()}`, { scroll: false });

  const onSelectDate = (d?: Date) => {
    if (!d) return;
    const iso = format(d, "yyyy-MM-dd");
    push(setParam(sp, "date", iso));
  };

  return (
    <div className="space-y-4">
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
            variant={view === "accepted" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "accepted"))}>
            Accepted
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                view === "accepted" && "bg-background/20",
              )}>
              {acceptedCount}
            </Badge>
          </Button>

          <Button
            variant={view === "rejected" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "rejected"))}>
            Rejected
            <Badge
              variant="secondary"
              className={cn(
                "ml-2 rounded-full",
                view === "rejected" && "bg-background/20",
              )}>
              {rejectedCount}
            </Badge>
          </Button>

          <Button
            variant={view === "all" ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => push(setParam(sp, "view", "all"))}>
            All
          </Button>

          {/* Type filter */}
          <Select
            value={type}
            onValueChange={(v) => push(setParam(sp, "type", v))}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="TABLE">Table</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right controls: search + date */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            className="md:w-60 rounded-xl"
            placeholder="Search name / phone / email"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const val = (e.target as HTMLInputElement).value.trim();
              push(setParam(sp, "q", val || undefined));
            }}
          />

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
    </div>
  );
}
