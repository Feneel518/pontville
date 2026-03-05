import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDashboardStats } from "@/lib/actions/dashboard/dashboard/getDashboardStats";
import {
  getTodayBookings,
  getTodayOrders,
} from "@/lib/actions/dashboard/dashboard/getTodayLists";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { formatUsd } from "@/lib/helpers/formatCurrency";

function money(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format((cents || 0) / 100);
}

export default async function DashboardPage() {
  // replace with your real restaurantId resolver (session / settings / env)
  const restaurantId = await getRestaurantId();

  const [stats, bookings, orders] = await Promise.all([
    getDashboardStats(restaurantId),
    getTodayBookings(restaurantId),
    getTodayOrders(restaurantId),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Today’s overview (bookings, sales, inquiries)
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Bookings Today
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold">
              {stats.bookings.todayCount}
            </div>
            {stats.bookings.pendingTodayCount > 0 ? (
              <Badge variant="destructive">
                {stats.bookings.pendingTodayCount} pending
              </Badge>
            ) : (
              <Badge variant="secondary">All handled</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Inquiries Today
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.inquiries.todayCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Orders Today
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold">
              {stats.orders.todayCount}
            </div>
            <Badge variant="secondary">
              {stats.orders.paidTodayCount} paid
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Revenue Today (Paid)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {formatUsd(stats.revenue.total)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today’s Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bookings today.
              </p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {b.phone || "—"} • {b.email || "—"}
                      </div>
                      <div className="text-sm">
                        Guests:{" "}
                        <span className="font-medium">
                          {b.tableInquiry?.guests ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          b.status === "PENDING"
                            ? "destructive"
                            : b.status === "ACCEPTED"
                              ? "default"
                              : "secondary"
                        }>
                        {b.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Items Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              stats.topItems.map((i) => (
                <div key={i.name} className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.qty} sold
                    </div>
                  </div>
                  <div className="text-sm font-medium">{money(i.revenue)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today’s Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders today.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="font-medium">
                      #{o.orderNo} • {o.customerName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {o.customerPhone} •{" "}
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{o.paymentStatus}</Badge>
                    <Badge variant="outline">{o.status}</Badge>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="font-semibold">{formatUsd(o.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
