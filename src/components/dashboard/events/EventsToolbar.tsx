"use client";

import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  EventSort,
  eventsParsers,
  EventsQP,
  EventStatusFilter,
  EventTimeFilter,
  EventTypeFilter,
} from "@/lib/searchParams/EventSearchParams";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import React, { FC, useState } from "react";
import EventForm from "./EventForm";

interface EventsToolbarProps {
  qp: EventsQP;
}

const EventsToolbar: FC<EventsToolbarProps> = ({ qp }) => {
  const [state, setState] = useQueryStates(eventsParsers, { shallow: false });
  const [open, setOpen] = useState(false);

  // local controlled search input
  const [search, setSearch] = React.useState(state.q ?? "");
  const debouncedSearch = useDebouncedValue(search, 500);

  // update URL when debounced value changes
  React.useEffect(() => {
    setState({ q: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeFilters =
    (qp.q ? 1 : 0) +
    (qp.status !== "ALL" ? 1 : 0) +
    (qp.type !== "ALL" ? 1 : 0) +
    (qp.time !== "ALL" ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center max-md:grid max-md:grid-cols-2">
        <Input
          className="md:col-span-2 md:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title / description / highlight…"
        />

        {/* Status */}
        <Select
          value={state.status ?? "ALL"}
          onValueChange={(v) => setState({ status: v as any, page: 1 })}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {EventStatusFilter.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select
          value={state.type ?? "ALL"}
          onValueChange={(v) => setState({ type: v as any, page: 1 })}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {EventTypeFilter.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time */}
        <Select
          value={state.time ?? "ALL"}
          onValueChange={(v) => setState({ time: v as any, page: 1 })}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            {EventTimeFilter.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${state.sort ?? "startsAt"}:${state.dir ?? "asc"}`}
          onValueChange={(v) => {
            const [sort, dir] = v.split(":");
            setState({ sort: sort as any, dir: dir as any, page: 1 });
          }}>
          <SelectTrigger className="w-full md:w-60">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {EventSort.map((s) => (
              <div key={s}>
                <SelectItem value={`${s}:asc`}>Sort: {s} (asc)</SelectItem>
                <SelectItem value={`${s}:desc`}>Sort: {s} (desc)</SelectItem>
              </div>
            ))}
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              setState({
                q: "",
                status: "ALL",
                type: "ALL",
                time: "ALL",
                sort: "startsAt",
                dir: "asc",
                page: 1,
              })
            }>
            <X className="mr-2 h-4 w-4" />
            Reset ({activeFilters})
          </Button>
        )}
      </div>

      <ResponsiveModal
        onOpenChange={setOpen}
        open={open}
        title={""}
        trigger={<Button>Create Event</Button>}>
        <EventForm mode="create" setOpen={setOpen}></EventForm>
      </ResponsiveModal>
    </div>
  );
};

export default EventsToolbar;
