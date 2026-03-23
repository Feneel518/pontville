"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-3 p-4">
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
          <div className="rounded-sm bg-primary/50 p-2 text-center text-xl text-white">
            {props.status}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={loading !== null}
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
