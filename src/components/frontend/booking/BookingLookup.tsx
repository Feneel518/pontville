"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Users,
  PartyPopper,
  Mail,
  Phone,
  ChevronRight,
  Search,
} from "lucide-react";
import { listPublicBookings } from "@/lib/actions/frontend/booking/listPublicBookings";

type Row = Awaited<ReturnType<typeof listPublicBookings>>[number];

function badgeForStatus(status: string) {
  if (status === "ACCEPTED")
    return <Badge className="rounded-full">CONFIRMED</Badge>;
  if (status === "REJECTED")
    return (
      <Badge variant="destructive" className="rounded-full">
        NOT AVAILABLE
      </Badge>
    );
  if (status === "CANCELLED")
    return (
      <Badge variant="destructive" className="rounded-full">
        CANCELLED
      </Badge>
    );
  return (
    <Badge variant="secondary" className="rounded-full">
      RECEIVED
    </Badge>
  );
}

function fmtDT(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function fmtD(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default function BookingLookup() {
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  async function runSearch() {
    const v = q.trim();
    if (v.length < 3) {
      toast.error("Enter at least 3 characters");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await listPublicBookings({ q: v });
      setRows(res);
    } catch (e: any) {
      toast.error(e?.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="rounded-3xl border bg-background p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-muted/20 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Enter your email or phone"
              className="border-0 bg-transparent p-0 focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
          </div>

          <Button
            onClick={runSearch}
            disabled={loading}
            className="rounded-2xl">
            {loading ? "Searching..." : "Find my bookings"}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email works best
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Or phone number
          </span>
        </div>
      </div>

      {/* Results */}
      {hasSearched && rows.length === 0 ? (
        <div className="rounded-3xl border bg-muted/10 p-10 text-center">
          <div className="text-sm font-medium">No bookings found</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Try a different email/phone or check spelling.
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((r) => {
            const isTable = r.type === "TABLE";
            const isEvent = r.type === "EVENT";

            const when = isTable
              ? fmtDT(r.tableInquiry?.bookingAt ?? null)
              : fmtD(r.eventInquiry?.eventDate ?? null);

            const meta = isTable
              ? `${r.tableInquiry?.guests ?? "—"} guests`
              : `${r.eventInquiry?.eventType ?? "Event"}`;

            return (
              <Link
                key={r.id}
                href={`/booking/${r.id}`}
                className={cn(
                  "group block rounded-3xl border bg-background p-4 transition",
                  "hover:bg-muted/20",
                )}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {/* Left */}
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Restaurant logo */}
                    <div className="mt-0.5">
                      {r.restaurant?.logoUrl ? (
                        <div className="relative h-11 w-11 overflow-hidden rounded-2xl border bg-muted">
                          <Image
                            src={r.restaurant.logoUrl}
                            alt={r.restaurant?.name ?? "Restaurant"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-muted/30">
                          {isTable ? (
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <PartyPopper className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold">
                          {r.restaurant?.name ?? "Restaurant"}
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {r.type}
                        </Badge>
                        {badgeForStatus(r.status)}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {when}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {isTable ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <PartyPopper className="h-4 w-4" />
                          )}
                          {meta}
                        </span>
                      </div>

                      {r.notes ? (
                        <div className="mt-2 truncate text-xs text-muted-foreground">
                          Note: {r.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <div className="text-right text-xs text-muted-foreground">
                      Ref:{" "}
                      <span className="font-medium">
                        {r.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <Button
                      variant="secondary"
                      className="rounded-full opacity-0 transition group-hover:opacity-100"
                      asChild>
                      <span>
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </Button>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div>
                    Submitted:{" "}
                    {new Date(r.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                  <div>
                    Status: <span className="font-medium">{r.status}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
