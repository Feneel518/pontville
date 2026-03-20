import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { getBookingById } from "@/lib/actions/dashboard/bookings/getBookingById";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BookingActionsPanel from "@/components/dashboard/booking/BookingActionPanel";
import { formatRestaurantDateTime } from "@/lib/helpers/timeHelpers";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("bookings");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const { id } = await params;
  const booking = await getBookingById({ restaurantId, id });

  const bookingAt = booking.tableInquiry?.bookingAt ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-2xl">Booking</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            TABLE
          </Badge>
          <Badge
            variant={booking.status === "CANCELLED" ? "destructive" : "default"}
            className="rounded-full">
            {booking.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="text-lg font-semibold">{booking.name}</div>
              <div className="text-sm text-muted-foreground">
                {booking.email ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {booking.phone ?? "—"}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Booking details
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Booking at:</span>{" "}
                  <span className="font-medium">
                    {bookingAt ? formatRestaurantDateTime(bookingAt) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Guests:</span>{" "}
                  <span className="font-medium">
                    {booking.tableInquiry?.guests ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {booking.notes ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Customer notes
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {booking.notes}
                  </div>
                </div>
              </>
            ) : null}

            {booking.staffNote ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Staff note
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {booking.staffNote}
                  </div>
                </div>
              </>
            ) : null}

            <Separator />
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <div>Created: {formatRestaurantDateTime(booking.createdAt)}</div>
              <div>
                {booking.handledAt
                  ? `Handled: ${formatRestaurantDateTime(booking.handledAt)}`
                  : "—"}
              </div>
            </div>
          </CardContent>
        </Card>

        <BookingActionsPanel
          bookingId={booking.id}
          status={booking.status}
          initialNote={booking.staffNote ?? ""}
        />
      </div>
    </div>
  );
}
