import { requireUser } from "@/lib/checks/requireUser";
import { Card, CardContent } from "@/components/ui/card";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

import InquiriesToolbar from "@/components/dashboard/inquiries/InquiriesToolbar";
import {
  InquiriesView,
  listInquiriesForDate,
} from "@/lib/actions/dashboard/inquiries/listInquiriesAction";
import InquiriesList from "@/components/dashboard/inquiries/InquiryDetailsSheet";
import { getRestaurantTodayISO } from "@/lib/helpers/timeHelpers";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPendingInquiryDates } from "@/lib/actions/dashboard/inquiries/getPendingInquiryDates";

type SP = {
  date?: string;
  view?: InquiriesView;
  cursor?: string;
  pageSize?: string;
  q?: string;
  type?: "TABLE" | "EVENT";
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireUser("inquiries");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const sp = (await searchParams) ?? {};
  const date = sp.date ?? getRestaurantTodayISO();
  const view: InquiriesView = sp.view ?? "pending";
  const cursor = sp.cursor || undefined;
  const pageSize = Math.min(Math.max(Number(sp.pageSize ?? 30) || 30, 10), 100);

  const res = await listInquiriesForDate({
    restaurantId,
    dateStr: date,
    view,
    pageSize,
    cursor,
    q: sp.q,
    type: sp.type,
  });

  const pendingOther = await listInquiriesForDate({
    restaurantId,
    dateStr: date,
    view: "pending",
    pageSize: 50,
    cursor: undefined,
    q: sp.q,
    type: sp.type,
    excludeDate: true, // 👈 we'll add this
  });

  const pendingDates = await getPendingInquiryDates(restaurantId);

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <div className="text-2xl">Inquiries</div>
      </div>

      <InquiriesToolbar
        date={date}
        view={view}
        q={sp.q ?? ""}
        type={sp.type ?? ""}
        pendingCount={res.pendingCount}
        acceptedCount={res.acceptedCount}
        rejectedCount={res.rejectedCount}
        pendingDates={pendingDates}
      />

      <Card className="rounded-2xl">
        <CardContent className="p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-muted-foreground">
              PendingToday
            </div>

            <Badge variant="secondary" className="rounded-full">
              {res.inquiries.length}
            </Badge>
          </div>
          <InquiriesList
            inquiries={res.inquiries as any}
            nextCursor={res.nextCursor}
            date={date}
            view={view}
            pageSize={pageSize}
            q={sp.q ?? ""}
            type={sp.type ?? ""}
          />
        </CardContent>
      </Card>

      <Separator className="my-10"></Separator>

      {/* PENDING OTHER DAYS */}
      {pendingOther.inquiries.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground">
                Pending from other days
              </div>

              <Badge variant="secondary" className="rounded-full">
                {pendingOther.inquiries.length}
              </Badge>
            </div>

            <InquiriesList
              inquiries={pendingOther.inquiries as any}
              nextCursor={null} // no pagination needed here
              date={date}
              view="pending"
              pageSize={pageSize}
              q={sp.q ?? ""}
              type={sp.type ?? ""}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
