import BookingLookup from "@/components/frontend/booking/BookingLookup";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingIndexPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      <div className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight">My bookings</div>
        <div className="text-sm text-muted-foreground">
          Enter your email or phone number to view your table bookings and event
          inquiries.
        </div>
      </div>

      <Card className="mt-6 rounded-3xl">
        <CardContent className="p-5 md:p-6">
          <BookingLookup />
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        Tip: Use the same email/phone you entered while booking.
      </div>
    </div>
  );
}
