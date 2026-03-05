"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decideInquiryAction } from "@/lib/actions/frontend/decideInquiryAction";

export default function InquiryDecisionPanel(props: {
  inquiryId: string;
  status: string;
  initialStaffNote: string;
}) {
  const [note, setNote] = React.useState(props.initialStaffNote);
  const [loading, setLoading] = React.useState<null | "ACCEPTED" | "REJECTED">(
    null,
  );

  async function decide(status: "ACCEPTED" | "REJECTED") {
    try {
      setLoading(status);
      await decideInquiryAction({
        inquiryId: props.inquiryId,
        status,
        staffNote: note,
      });
      toast.success(`Marked as ${status.toLowerCase()}`);
      // let the server component re-render
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Decision</div>
          <Badge variant="outline" className="rounded-full">
            {props.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Staff note (optional)
          </div>
          <Textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {props.status === "ACCEPTED" || props.status === "REJECTED" ? (
          <div className="text-center text-xl  p-2 bg-primary/50 rounded-sm text-white">
            {props.status}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={loading !== null}
              variant={"default"}
              onClick={() => decide("ACCEPTED")}>
              {loading === "ACCEPTED" ? "Accepting..." : "Accept"}
            </Button>
            <Button
              variant="outline"
              disabled={loading !== null}
              onClick={() => decide("REJECTED")}>
              {loading === "REJECTED" ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
