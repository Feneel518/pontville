"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/helpers/formatCurrency";

type CustomerRow = {
  key: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  lastSeenAt: string; // from JSON
  ordersCount: number;
  inquiriesCount: number;
  totalSpent: number; // cents
};

function money(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format((cents || 0) / 100);
}

function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

async function fetchCustomers(params: {
  restaurantId: string;
  q: string;
  cursor?: string | null;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  sp.set("restaurantId", params.restaurantId);
  if (params.q) sp.set("q", params.q);
  if (params.cursor) sp.set("cursor", params.cursor);
  sp.set("limit", String(params.limit ?? 20));

  const res = await fetch(`/api/dashboard/customers?${sp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json() as Promise<{
    items: CustomerRow[];
    nextCursor: string | null;
  }>;
}

export default function CustomersList({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q, 350);

  const [items, setItems] = React.useState<CustomerRow[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // sentinel for infinite scroll
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  const loadFirst = React.useCallback(async () => {
    setError(null);
    setIsInitialLoading(true);
    setCursor(null);

    try {
      const data = await fetchCustomers({
        restaurantId,
        q: dq,
        cursor: null,
        limit: 20,
      });
      setItems(data.items);
      setNextCursor(data.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "Error");
      setItems([]);
      setNextCursor(null);
    } finally {
      setIsInitialLoading(false);
    }
  }, [restaurantId, dq]);

  const loadMore = React.useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);

    try {
      const data = await fetchCustomers({
        restaurantId,
        q: dq,
        cursor: nextCursor,
        limit: 20,
      });
      setItems((prev) => [...prev, ...data.items]);
      setCursor(nextCursor);
      setNextCursor(data.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setIsLoadingMore(false);
    }
  }, [restaurantId, dq, nextCursor, isLoadingMore]);

  // reload on search
  React.useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // intersection observer
  React.useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (hit) loadMore();
      },
      { rootMargin: "700px" }, // prefetch before reaching bottom
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Searchable directory (Orders + Inquiries). Cursor paginated.
            </p>
          </div>
          <div className="w-[280px]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, email…"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="h-4 w-48" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customers found.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border p-3",
                )}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name || "—"}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {c.phone || "—"} • {c.email || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last seen: {new Date(c.lastSeenAt).toLocaleString("en-AU")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{c.ordersCount} orders</Badge>
                  <Badge variant="outline">{c.inquiriesCount} inquiries</Badge>
                  <div className="w-[120px] text-right font-semibold">
                    {formatUsd(c.totalSpent)}
                  </div>
                </div>
              </div>
            ))}

            {/* sentinel */}
            <div ref={loadMoreRef} />

            {isLoadingMore ? (
              <div className="rounded-lg border p-3">
                <Skeleton className="h-4 w-56" />
              </div>
            ) : nextCursor ? (
              <p className="text-center text-xs text-muted-foreground">
                Loading more when you scroll…
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                You’ve reached the end.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
