"use client";

import * as React from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cancelBookingAction } from "@/lib/actions/dashboard/bookings/cancelBookingAction";
// optionally add resend action later

export default function BookingActionsPanel(props: {
  bookingId: string;
  status: string;
  initialNote: string;
}) {
  const [note, setNote] = React.useState(props.initialNote);
  const [loading, setLoading] = React.useState(false);

  async function cancel() {
    try {
      setLoading(true);
      await cancelBookingAction({ id: props.bookingId, reason: note });
      toast.success("Booking cancelled");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Actions</div>
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

        <Button
          variant="destructive"
          className="w-full rounded-xl"
          disabled={loading || props.status === "CANCELLED"}
          onClick={cancel}>
          {props.status === "CANCELLED"
            ? "Already cancelled"
            : loading
              ? "Cancelling..."
              : "Cancel booking"}
        </Button>

        {/* Later: Resend email / Download ICS */}
        {/* <Button variant="secondary" className="w-full rounded-xl">Resend confirmation</Button> */}
      </CardContent>
    </Card>
  );
}
