import { requireUser } from "@/lib/checks/requireUser";
import { Card, CardContent } from "@/components/ui/card";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

import InquiriesToolbar from "@/components/dashboard/inquiries/InquiriesToolbar";
import {
  InquiriesView,
  listInquiriesForDate,
} from "@/lib/actions/dashboard/inquiries/listInquiriesAction";
import InquiriesList from "@/components/dashboard/inquiries/InquiryDetailsSheet";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
  const date = sp.date ?? todayISO();
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
      />

      <Card className="rounded-2xl">
        <CardContent className="p-3 md:p-4">
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
    </div>
  );
}
