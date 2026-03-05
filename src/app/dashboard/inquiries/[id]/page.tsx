import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


import { getInquiryById } from "@/lib/actions/frontend/getInquiryById";
import { listAcceptedBookingsForDay, listPendingTableInquiriesForDay } from "@/lib/actions/frontend/menu/listBookingForDay";
import InquiryDecisionPanel from "@/components/dashboard/inquiries/InquiryDecisionPanel";
import BookingsForDayList from "@/components/dashboard/inquiries/BookingsForDayList";

function isoFromDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("inquiries");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const { id } = await params;
  const inquiry = await getInquiryById({ restaurantId, inquiryId: id });

  const isTable = inquiry.type === "TABLE";
  const bookingDateStr =
    isTable && inquiry.tableInquiry?.bookingAt
      ? isoFromDate(new Date(inquiry.tableInquiry.bookingAt))
      : null;

  const acceptedSameDay = bookingDateStr
    ? await listAcceptedBookingsForDay({
        restaurantId,
        dateStr: bookingDateStr,
      })
    : [];
  const pendingSameDay = bookingDateStr
    ? await listPendingTableInquiriesForDay({
        restaurantId,
        dateStr: bookingDateStr,
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-2xl">Inquiry</div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            {inquiry.type}
          </Badge>
          <Badge
            variant={
              inquiry.status === "REJECTED"
                ? "destructive"
                : inquiry.status === "ACCEPTED"
                  ? "default"
                  : "secondary"
            }
            className="rounded-full">
            {inquiry.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT: Details */}
        <Card className="rounded-2xl lg:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="text-lg font-semibold">{inquiry.name}</div>
              <div className="text-sm text-muted-foreground">
                {inquiry.email ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {inquiry.phone ?? "—"}
              </div>
            </div>

            <Separator />

            {inquiry.type === "TABLE" ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Table request
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Booking at:</span>{" "}
                    <span className="font-medium">
                      {inquiry.tableInquiry?.bookingAt
                        ? new Date(
                            inquiry.tableInquiry.bookingAt,
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Guests:</span>{" "}
                    <span className="font-medium">
                      {inquiry.tableInquiry?.guests ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Event request
                </div>
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event type:</span>{" "}
                    <span className="font-medium">
                      {inquiry.eventInquiry?.eventType ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Event date:</span>{" "}
                    <span className="font-medium">
                      {inquiry.eventInquiry?.eventDate
                        ? new Date(
                            inquiry.eventInquiry.eventDate,
                          ).toLocaleDateString("en-IN", { dateStyle: "medium" })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Expected guests:
                    </span>{" "}
                    <span className="font-medium">
                      {inquiry.eventInquiry?.expectedGuests ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>{" "}
                    <span className="font-medium">
                      {inquiry.eventInquiry?.budget ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {inquiry.notes ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Customer notes
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {inquiry.notes}
                  </div>
                </div>
              </>
            ) : null}

            {inquiry.staffNote ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Staff note
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {inquiry.staffNote}
                  </div>
                </div>
              </>
            ) : null}

            <Separator />
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <div>
                Created:{" "}
                {new Date(inquiry.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div>
                {inquiry.handledAt
                  ? `Handled: ${new Date(inquiry.handledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                  : "Not handled yet"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Decision panel */}
        <InquiryDecisionPanel
          inquiryId={inquiry.id}
          status={inquiry.status}
          initialStaffNote={inquiry.staffNote ?? ""}
        />

        {/* Same-day context */}
        {bookingDateStr ? (
          <div className="lg:col-span-3 space-y-3">
            <div className="text-sm font-medium">
              Bookings for {bookingDateStr} (booking date)
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <BookingsForDayList
                    title="Accepted bookings"
                    rows={acceptedSameDay as any}
                    emptyText="No accepted bookings for this date."
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <BookingsForDayList
                    title="Pending table inquiries"
                    rows={pendingSameDay as any}
                    emptyText="No pending inquiries for this date."
                    highlightId={inquiry.id}
                    showDecisionButtons
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
