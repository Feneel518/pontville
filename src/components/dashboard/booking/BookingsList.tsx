import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Mail, Phone, Users, CalendarDays } from "lucide-react";
import type { Inquiry, TableInquiry } from "@prisma/client";
import type { BookingsView } from "@/lib/actions/dashboard/bookings/listBookings";

type BookingRow = Inquiry & { tableInquiry?: TableInquiry | null };

function timeHHMM(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusVariant(status: string) {
  if (status === "CANCELLED") return "destructive";
  return "default";
}

export default function BookingsList(props: {
  bookings: BookingRow[];
  nextCursor: string | null;
  date: string;
  view: BookingsView;
  pageSize: number;
  q: string;
}) {
  const { bookings, nextCursor, date, view, pageSize, q } = props;

  if (!bookings.length) {
    return (
      <div className="rounded-2xl border bg-muted/20 p-10 text-center">
        <div className="text-sm font-medium">No bookings for {date}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Try changing date/view or search.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookings.map((b) => {
        const created = new Date(b.createdAt);
        const bookingAt = b.tableInquiry?.bookingAt
          ? new Date(b.tableInquiry.bookingAt)
          : null;

        return (
          <Link
            key={b.id}
            href={`/dashboard/bookings/${b.id}`}
            className={cn(
              "group block rounded-2xl border bg-background p-4 transition",
              "hover:bg-muted/20",
            )}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">
                    #{b.id.slice(-6).toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeHHMM(created)}
                  </div>

                  <Badge variant="outline" className="rounded-full">
                    TABLE
                  </Badge>
                  <Badge
                    variant={statusVariant(b.status)}
                    className="rounded-full">
                    {b.status}
                  </Badge>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>
                    <div className="truncate text-sm font-medium">{b.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {b.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {b.email}
                        </span>
                      ) : null}
                      {b.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {b.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Booking</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {bookingAt
                          ? bookingAt.toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {b.tableInquiry?.guests ?? "—"} guests
                      </span>
                    </div>

                    {b.notes ? (
                      <div className="mt-2 truncate text-xs text-muted-foreground">
                        Note: {b.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
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
                Created:{" "}
                {new Date(b.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div>
                Booking:{" "}
                {bookingAt
                  ? bookingAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </div>
            </div>
          </Link>
        );
      })}

      {nextCursor ? (
        <div className="flex justify-center pt-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link
              href={`?date=${encodeURIComponent(date)}&view=${encodeURIComponent(view)}&pageSize=${pageSize}&cursor=${encodeURIComponent(nextCursor)}&q=${encodeURIComponent(q ?? "")}`}
              scroll={false}>
              Load more
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
