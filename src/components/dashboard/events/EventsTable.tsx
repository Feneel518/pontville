"use client";

import { eventsParsers, EventsQP } from "@/lib/searchParams/EventSearchParams";
import { Event } from "@prisma/client";
import React, { FC, useState } from "react";
import { useQueryStates } from "nuqs";
import EventsToolbar from "./EventsToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatEventDateLabel, to12HourTime } from "@/lib/helpers/timeHelpers";
import { typeBadge } from "@/lib/helpers/uiHelpers";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import EventForm from "./EventForm";
import { getBadgeVariantFromStatus } from "@/lib/helpers/BadgeSelection";

interface EventsTableProps {
  items: Event[];
  total: number;
  page: number;
  pageSize: number;
  qp: EventsQP;
}
const EventsTable: FC<EventsTableProps> = ({
  items,
  page,
  pageSize,
  qp,
  total,
}) => {
  const [, setState] = useQueryStates(eventsParsers, {
    shallow: false,
  });

  const [open, setOpen] = useState(false);
  const [banners, setBanners] = React.useState<Event[]>(items);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editBanner, setEditBanner] = useState<Event | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const clampPage = (n: number) => Math.min(totalPages, Math.max(1, n));

  // local input state
  const [pageInput, setPageInput] = React.useState<string>(String(page));

  React.useEffect(() => {
    // keep in sync when arrows/filter changes page
    setPageInput(String(page));
  }, [page]);

  const commitPage = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setPageInput(String(page));
      return;
    }

    const next = clampPage(Math.trunc(n));
    setPageInput(String(next));

    if (next !== page) setState({ page: next });
  };
  console.log(items);

  return (
    <div className="space-y-4">
      <EventsToolbar qp={qp} />

      <div className="p-2 grid md:grid-cols-3 gap-8">
        {items.map((ev, idx) => (
          <Card key={ev.id} className="rounded-2xl group">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                {typeBadge(ev.type)}
                <Badge variant={getBadgeVariantFromStatus(ev.status)}>
                  {ev.status}
                </Badge>
                {ev.isTicketed ? (
                  <Badge variant="outline" className="gap-1">
                    <Ticket className="h-3.5 w-3.5" />
                    {ev.priceLabel ?? "Ticketed"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free entry</Badge>
                )}
              </div>
              <div className="w-full h-64 overflow-hidden relative">
                <Image
                  alt="Event Image"
                  src={ev.image ? ev.image : "/Book.jpg"}
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-300 ease-in-out"></Image>
              </div>

              <CardTitle className="text-xl">{ev.title}</CardTitle>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary/80" />
                  <span>{formatEventDateLabel(ev.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/80" />
                  <span>{to12HourTime(ev.startTime)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {ev.description}
              </p>

              {ev.highlight ? (
                <div className="rounded-xl border bg-card px-3 py-2 text-sm">
                  <span className="font-medium">Highlight:</span>{" "}
                  <span className="text-muted-foreground">{ev.highlight}</span>
                </div>
              ) : null}

              <Button asChild className="w-full" variant={"elegant"}>
                <ResponsiveModal
                  onOpenChange={setOpen}
                  open={open}
                  title={""}
                  trigger={
                    <Button
                      className="w-full"
                      onClick={() => setEditBanner(ev)}>
                      Edit
                    </Button>
                  }>
                  <EventForm
                    open={openEdit}
                    mode="edit"
                    initial={editBanner ?? undefined}
                    setOpen={(v) => {
                      if (!v) setEditBanner(null);
                    }}
                    setOpenChange={setOpenEdit}
                    onUpdated={(updated) => {
                      setBanners((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x)),
                      );
                      setEditBanner(null);
                    }}></EventForm>
                </ResponsiveModal>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!canPrev}
            onClick={() => setState({ page: page - 1 })}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
            <span className="text-sm text-muted-foreground">Page</span>

            <div className="w-6">
              <Input
                className="bg-transparent  p-0 pl-2 border-none "
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(e) => {
                  // allow empty while typing; strip non-digits
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setPageInput(v);
                }}
                onBlur={() => commitPage(pageInput)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPage(pageInput);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setPageInput(String(page));
                  }
                }}
                aria-label="Go to page"
              />
            </div>

            <span className="text-sm text-muted-foreground">
              / {totalPages}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => commitPage(pageInput)}
              className="h-8">
              Go
            </Button>
          </div>
          <Button
            variant="outline"
            disabled={!canNext}
            onClick={() => setState({ page: page + 1 })}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventsTable;
