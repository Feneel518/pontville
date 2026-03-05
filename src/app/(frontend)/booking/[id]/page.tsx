import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
  XCircle,
  Ban,
  Download,
  MessageCircle,
  PartyPopper,
  Wallet,
} from "lucide-react";
import { getPublicBooking } from "@/lib/actions/frontend/booking/getPublicBooking";

function statusUI(status: string) {
  if (status === "ACCEPTED")
    return {
      title: "Confirmed",
      sub: "Your request is confirmed. We look forward to hosting you.",
      badge: { text: "CONFIRMED", variant: "default" as const },
      icon: <CheckCircle2 className="h-5 w-5" />,
      accent: "text-emerald-600",
      ring: "ring-emerald-500/15",
      bg: "bg-emerald-500/10",
    };

  if (status === "REJECTED")
    return {
      title: "Not Available",
      sub: "We couldn’t accommodate this request at the selected time.",
      badge: { text: "NOT AVAILABLE", variant: "destructive" as const },
      icon: <XCircle className="h-5 w-5" />,
      accent: "text-red-600",
      ring: "ring-red-500/15",
      bg: "bg-red-500/10",
    };

  if (status === "CANCELLED")
    return {
      title: "Cancelled",
      sub: "This booking has been cancelled. Contact us to rebook quickly.",
      badge: { text: "CANCELLED", variant: "destructive" as const },
      icon: <Ban className="h-5 w-5" />,
      accent: "text-red-600",
      ring: "ring-red-500/15",
      bg: "bg-red-500/10",
    };

  return {
    title: "Inquiry Received",
    sub: "We’ve received your request. Our team will confirm shortly.",
    badge: { text: "RECEIVED", variant: "secondary" as const },
    icon: <Clock className="h-5 w-5" />,
    accent: "text-amber-600",
    ring: "ring-amber-500/15",
    bg: "bg-amber-500/10",
  };
}

function formatDT(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatD(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default async function BookingPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getPublicBooking({ id });
  if (!inquiry) notFound();

  const r = inquiry.restaurant;
  const ui = statusUI(inquiry.status);

  const isTable = inquiry.type === "TABLE";
  const isEvent = inquiry.type === "EVENT";

  const address = [r?.addressLine, r?.city, r?.state]
    .filter(Boolean)
    .join(", ");
  const telHref = r?.phone ? `tel:${r.phone}` : undefined;
  const mailHref = r?.email ? `mailto:${r.email}` : undefined;

  const whatsapp = process.env.WHATSAPP_BUSINESS_E164
    ? `https://wa.me/${process.env.WHATSAPP_BUSINESS_E164.replace("+", "")}?text=${encodeURIComponent(
        `Hi! I have a booking query. Ref: ${inquiry.id}`,
      )}`
    : undefined;

  // Calendar download for TABLE accepted (and EVENT accepted too)
  const canDownloadICS =
    inquiry.status === "ACCEPTED" &&
    ((isTable && inquiry.tableInquiry?.bookingAt) ||
      (isEvent && inquiry.eventInquiry?.eventDate));

  const icsHref = canDownloadICS ? `/api/booking/${inquiry.id}/ics` : undefined;

  // Details for table
  const bookingAt = isTable ? (inquiry.tableInquiry?.bookingAt ?? null) : null;
  const guests = isTable ? (inquiry.tableInquiry?.guests ?? null) : null;

  // Details for event
  const eventType = isEvent ? (inquiry.eventInquiry?.eventType ?? null) : null;
  const eventDate = isEvent ? (inquiry.eventInquiry?.eventDate ?? null) : null;
  const expectedGuests = isEvent
    ? (inquiry.eventInquiry?.expectedGuests ?? null)
    : null;
  const budget = isEvent ? (inquiry.eventInquiry?.budget ?? null) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      {/* Hero */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border bg-background p-6 md:p-10",
          "shadow-sm",
        )}>
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-70",
            ui.bg,
          )}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border bg-background",
                "ring-1",
                ui.ring,
              )}>
              <div className={ui.accent}>{ui.icon}</div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold">{ui.title}</h1>
                <Badge variant={ui.badge.variant} className="rounded-full">
                  {ui.badge.text}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {inquiry.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{ui.sub}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Reference: <span className="font-medium">{inquiry.id}</span>
              </div>
            </div>
          </div>

          {/* Restaurant identity */}
          <div className="flex items-center gap-3 md:justify-end">
            {r?.logoUrl ? (
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border bg-muted">
                <Image
                  src={r.logoUrl}
                  alt={r?.name ?? "Restaurant"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {r?.name ?? "Restaurant"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {address || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Left: Details */}
        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Your request</div>
              <Badge variant="secondary" className="rounded-full">
                {inquiry.status}
              </Badge>
            </div>

            <Separator />

            {/* Request summary cards */}
            {isTable ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Date & time
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {formatDT(bookingAt)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Arrive 5–10 mins early
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Guests
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {guests ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    We’ll seat you as soon as possible
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PartyPopper className="h-4 w-4" />
                    Event type
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {eventType ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    We’ll confirm details after review
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Event date
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {formatD(eventDate)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Timing will be coordinated
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Expected guests
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {expectedGuests ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Helps us plan seating & service
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    Budget (optional)
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {budget ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    We can tailor packages
                  </div>
                </div>
              </div>
            )}

            {inquiry.notes ? (
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs text-muted-foreground">Your notes</div>
                <div className="mt-2 text-sm leading-relaxed">
                  {inquiry.notes}
                </div>
              </div>
            ) : null}

            {inquiry.staffNote ? (
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs text-muted-foreground">
                  Message from the team
                </div>
                <div className="mt-2 text-sm leading-relaxed">
                  {inquiry.staffNote}
                </div>
              </div>
            ) : null}

            {/* Timeline */}
            <div className="rounded-2xl border bg-muted/10 p-4">
              <div className="text-sm font-semibold">Status timeline</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">Submitted</div>
                  <div className="font-medium">
                    {formatDT(inquiry.createdAt)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">Decision</div>
                  <div className="font-medium">
                    {inquiry.handledAt
                      ? formatDT(inquiry.handledAt)
                      : "Pending"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Actions */}
        <Card className="rounded-3xl">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="text-sm font-semibold">Need help?</div>
            <p className="text-xs text-muted-foreground">
              Contact our team for changes, alternate times, or event
              coordination.
            </p>

            <div className="grid gap-2">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-2xl justify-start gap-2",
                  )}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}

              {telHref ? (
                <a
                  href={telHref}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "rounded-2xl justify-start gap-2",
                  )}>
                  <Phone className="h-4 w-4" />
                  Call {r?.phone}
                </a>
              ) : null}

              {mailHref ? (
                <a
                  href={mailHref}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "rounded-2xl justify-start gap-2",
                  )}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              ) : null}

              {address ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl justify-start gap-2"
                  disabled>
                  <MapPin className="h-4 w-4" />
                  {address}
                </Button>
              ) : null}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-semibold">Calendar</div>
              <p className="text-xs text-muted-foreground">
                Add your confirmed request to your calendar.
              </p>

              <Button
                asChild
                variant="outline"
                className="rounded-2xl justify-start gap-2"
                disabled={!icsHref}>
                {icsHref ? (
                  <a href={icsHref}>
                    <Download className="h-4 w-4" />
                    Download .ics
                  </a>
                ) : (
                  <span>
                    <Download className="h-4 w-4" />
                    Available after confirmation
                  </span>
                )}
              </Button>
            </div>

            <Separator />

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Tip</div>
              <div className="mt-1 text-sm">
                {isTable
                  ? "If you’re flexible, share an alternate time for faster confirmation."
                  : "Share venue needs, timing, and any special requirements to speed up planning."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        This page updates automatically when the restaurant takes action.
      </div>
    </div>
  );
}
