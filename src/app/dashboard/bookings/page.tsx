import { requireUser } from "@/lib/checks/requireUser";
import { Card, CardContent } from "@/components/ui/card";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

import {
  listBookingsForDate,
  BookingsView,
} from "@/lib/actions/dashboard/bookings/listBookings";
import BookingsToolbar from "@/components/dashboard/booking/BookingsToolbar";
import BookingsList from "@/components/dashboard/booking/BookingsList";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type SP = {
  date?: string;
  view?: BookingsView;
  cursor?: string;
  pageSize?: string;
  q?: string;
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireUser("bookings");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const sp = (await searchParams) ?? {};
  const date = sp.date ?? todayISO();
  const view: BookingsView = sp.view ?? "accepted";
  const cursor = sp.cursor || undefined;
  const pageSize = Math.min(Math.max(Number(sp.pageSize ?? 30) || 30, 10), 100);

  const res = await listBookingsForDate({
    restaurantId,
    dateStr: date,
    view,
    pageSize,
    cursor,
    q: sp.q,
  });

  return (
    <div className="space-y-4">
      <div className="text-2xl">Bookings</div>

      <BookingsToolbar
        date={date}
        view={view}
        q={sp.q ?? ""}
        acceptedCount={res.acceptedCount}
        cancelledCount={res.cancelledCount}
      />

      <Card className="rounded-2xl">
        <CardContent className="p-3 md:p-4">
          <BookingsList
            bookings={res.bookings as any}
            nextCursor={res.nextCursor}
            date={date}
            view={view}
            pageSize={pageSize}
            q={sp.q ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
