"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { decideInquiryAction } from "@/lib/actions/frontend/decideInquiryAction";

export default function BookingsForDayList(props: {
  title: string;
  rows: any[];
  emptyText: string;
  highlightId?: string;
  showDecisionButtons?: boolean; // only for pending list
}) {
  async function quickDecision(id: string, status: "ACCEPTED" | "REJECTED") {
    try {
      await decideInquiryAction({ inquiryId: id, status });
      toast.success(`Marked ${status.toLowerCase()}`);
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{props.title}</div>

      {!props.rows?.length ? (
        <div className="rounded-xl border bg-muted/20 p-6 text-sm text-muted-foreground">
          {props.emptyText}
        </div>
      ) : (
        props.rows.map((r) => {
          const bookingAt = r.tableInquiry?.bookingAt
            ? new Date(r.tableInquiry.bookingAt)
            : null;

          return (
            <div
              key={r.id}
              className={cn(
                "rounded-2xl border bg-background p-3",
                props.highlightId === r.id && "ring-2 ring-primary/40",
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold truncate">
                      {r.name}
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {r.type}
                    </Badge>
                    <Badge
                      variant={
                        r.status === "REJECTED"
                          ? "destructive"
                          : r.status === "ACCEPTED"
                            ? "default"
                            : "secondary"
                      }
                      className="rounded-full">
                      {r.status}
                    </Badge>
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {bookingAt
                      ? bookingAt.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}{" "}
                    • Guests: {r.tableInquiry?.guests ?? "—"}
                  </div>

                  {r.notes ? (
                    <div className="mt-2 truncate text-xs text-muted-foreground">
                      Note: {r.notes}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="rounded-full" asChild>
                    <Link href={`/dashboard/inquiries/${r.id}`}>
                      View <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {props.showDecisionButtons ? (
                <>
                  <Separator className="my-3" />
                  <div className="flex gap-2">
                    <Button
                      className="rounded-full"
                      onClick={() => quickDecision(r.id, "ACCEPTED")}>
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => quickDecision(r.id, "REJECTED")}>
                      Reject
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
