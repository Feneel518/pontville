import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Mail,
  Phone,
  Users,
  CalendarDays,
  PartyPopper,
} from "lucide-react";
import type { Inquiry, TableInquiry, EventInquiry } from "@prisma/client";

import { formatUsd } from "@/lib/helpers/formatCurrency";
import { InquiriesView } from "@/lib/actions/dashboard/inquiries/listInquiriesAction";

type InquiryFull = Inquiry & {
  tableInquiry?: TableInquiry | null;
  eventInquiry?: EventInquiry | null;
};

function timeHHMM(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusVariant(status: string) {
  if (status === "REJECTED") return "destructive";
  if (status === "ACCEPTED") return "default";
  if (status === "PENDING") return "secondary";
  return "outline";
}

function typeBadge(type: string) {
  return (
    <Badge variant="outline" className="rounded-full">
      {type}
    </Badge>
  );
}

export default function   InquiriesList(props: {
  inquiries: InquiryFull[];
  nextCursor: string | null;
  date: string;
  view: InquiriesView;
  pageSize: number;
  q: string;
  type: string;
}) {
  const { inquiries, nextCursor, date, view, pageSize, q, type } = props;

  if (!inquiries.length) {
    return (
      <div className="rounded-2xl border bg-muted/20 p-10 text-center">
        <div className="text-sm font-medium">No inquiries for {date}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Try switching view, changing date, or searching.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {inquiries.map((i) => {
        const created = new Date(i.createdAt);

        const isTable = i.type === "TABLE";
        const bookingAt = i.tableInquiry?.bookingAt
          ? new Date(i.tableInquiry.bookingAt)
          : null;

        const eventDate = i.eventInquiry?.eventDate
          ? new Date(i.eventInquiry.eventDate)
          : null;

        const primaryLine = isTable
          ? bookingAt
            ? bookingAt.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "No booking time"
          : eventDate
            ? eventDate.toLocaleDateString("en-IN", { dateStyle: "medium" })
            : "No event date";

        return (
          <Link
            key={i.id}
            href={`/dashboard/inquiries/${i.id}`}
            className={cn(
              "group block rounded-2xl border  p-4 transition",

              `${i.status === "ACCEPTED" ? "bg-green-100 hover:bg-green-50" : i.status === "REJECTED" ? "bg-red-100 hover:bg-red-50" : " bg-background"}`,
            )}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Left */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">
                    #{i.id.slice(-6).toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeHHMM(created)}
                  </div>

                  {typeBadge(i.type)}
                  <Badge
                    variant={statusVariant(i.status)}
                    className="rounded-full">
                    {i.status}
                  </Badge>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {/* Customer */}
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>
                    <div className="truncate text-sm font-medium">{i.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {i.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {i.email}
                        </span>
                      ) : null}
                      {i.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {i.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Request */}
                  <div className="min-w-0 md:col-span-2">
                    <div className="text-xs text-muted-foreground">
                      {isTable ? "Table Request" : "Event Request"}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {primaryLine}
                      </span>

                      {isTable ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {i.tableInquiry?.guests ?? "-"} guests
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <PartyPopper className="h-4 w-4" />
                            {i.eventInquiry?.eventType ?? "-"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {i.eventInquiry?.expectedGuests ?? "-"} guests
                          </span>
                          <span className="text-muted-foreground">
                            Budget: {formatUsd(i.eventInquiry?.budget ?? 0)}
                          </span>
                        </>
                      )}
                    </div>

                    {i.notes ? (
                      <div className="mt-2 truncate text-xs text-muted-foreground">
                        Note: {i.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right */}
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
                {new Date(i.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div>
                {isTable
                  ? `Booking: ${bookingAt ? bookingAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}`
                  : `Event: ${eventDate ? eventDate.toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}`}
              </div>
            </div>
          </Link>
        );
      })}

      {nextCursor ? (
        <div className="flex justify-center pt-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link
              href={`?date=${encodeURIComponent(date)}&view=${encodeURIComponent(view)}&pageSize=${pageSize}&cursor=${encodeURIComponent(nextCursor)}&q=${encodeURIComponent(
                q ?? "",
              )}&type=${encodeURIComponent(type ?? "")}`}
              scroll={false}>
              Load more
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
