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
import {
  formatRestaurantDate,
  formatRestaurantDateTime,
} from "@/lib/helpers/timeHelpers";

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

function formatDT(d?: Date | string | null) {
  if (!d) return "—";
  return formatRestaurantDateTime(d);
}

function formatD(d?: Date | string | null) {
  if (!d) return "—";
  return formatRestaurantDate(d);
}

export default async function BookingPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getPublicBooking({ id });
  console.log(id);
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

  const canDownloadICS =
    inquiry.status === "ACCEPTED" &&
    ((isTable && inquiry.tableInquiry?.bookingAt) ||
      (isEvent && inquiry.eventInquiry?.eventDate));

  const icsHref = canDownloadICS ? `/api/booking/${inquiry.id}/ics` : undefined;

  const bookingAt = isTable ? (inquiry.tableInquiry?.bookingAt ?? null) : null;
  const guests = isTable ? (inquiry.tableInquiry?.guests ?? null) : null;

  const eventType = isEvent ? (inquiry.eventInquiry?.eventType ?? null) : null;
  const eventDate = isEvent ? (inquiry.eventInquiry?.eventDate ?? null) : null;
  const expectedGuests = isEvent
    ? (inquiry.eventInquiry?.expectedGuests ?? null)
    : null;
  const budget = isEvent ? (inquiry.eventInquiry?.budget ?? null) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10 md:py-14">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border bg-background p-4 sm:p-6 md:p-10",
          "shadow-sm",
        )}>
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-70",
            ui.bg,
          )}
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-background",
                "ring-1",
                ui.ring,
              )}>
              <div className={ui.accent}>{ui.icon}</div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="text-wrap text-xl font-semibold sm:text-2xl">
                  {ui.title}
                </h1>
                <Badge variant={ui.badge.variant} className="rounded-full">
                  {ui.badge.text}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {inquiry.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{ui.sub}</p>
              <div className="mt-2 break-all text-xs text-muted-foreground">
                Reference: <span className="font-medium">{inquiry.id}</span>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            {r?.logoUrl ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border bg-muted">
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
              <div className="text-wrap text-xs text-muted-foreground">
                {address || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="space-y-5 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold">Your request</div>
              <Badge variant="secondary" className="w-fit rounded-full">
                {inquiry.status}
              </Badge>
            </div>

            <Separator />

            {/* your table/event blocks stay same */}

            <div className="rounded-2xl border bg-muted/10 p-4">
              <div className="text-sm font-semibold">Status timeline</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-muted-foreground">Submitted</div>
                  <div className="text-wrap text-sm font-medium">
                    {formatDT(inquiry.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-muted-foreground">Decision</div>
                  <div className="text-wrap text-sm font-medium">
                    {inquiry.handledAt
                      ? formatDT(inquiry.handledAt)
                      : "Pending"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
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
                    "h-auto min-h-10 w-full justify-start gap-2 rounded-2xl whitespace-normal text-left",
                  )}>
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 text-wrap">WhatsApp</span>
                </a>
              ) : null}

              {telHref ? (
                <a
                  href={telHref}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "h-auto min-h-10 w-full justify-start gap-2 rounded-2xl whitespace-normal text-left",
                  )}>
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-all">Call {r?.phone}</span>
                </a>
              ) : null}

              {mailHref ? (
                <a
                  href={mailHref}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "h-auto min-h-10 w-full justify-start gap-2 rounded-2xl whitespace-normal text-left",
                  )}>
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-all">Email</span>
                </a>
              ) : null}

              {address ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-10 w-full justify-start gap-2 rounded-2xl whitespace-normal text-left"
                  disabled>
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 text-wrap">{address}</span>
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
                className="h-auto min-h-10 w-full justify-start gap-2 rounded-2xl whitespace-normal text-left"
                disabled={!icsHref}>
                {icsHref ? (
                  <a href={icsHref}>
                    <Download className="h-4 w-4 shrink-0" />
                    <span className="text-wrap">Download .ics</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4 shrink-0" />
                    <span className="text-wrap">
                      Available after confirmation
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
