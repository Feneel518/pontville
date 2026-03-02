"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { OrderStatus, PaymentStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/lib/actions/dashboard/orders/orderAction";
import { updateOrderPaymentStatusAction } from "@/lib/actions/dashboard/orders/orderAction";

export default function OrderActions(props: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const { orderId } = props;

  const [status, setStatus] = React.useState<OrderStatus>(props.status);
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(
    props.paymentStatus,
  );
  const [loading, setLoading] = React.useState(false);

  const onUpdateStatus = async (next: OrderStatus) => {
    try {
      setLoading(true);
      setStatus(next);
      await updateOrderStatusAction({ orderId, status: next });
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
      setStatus(props.status);
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePayment = async (next: PaymentStatus) => {
    try {
      setLoading(true);
      setPaymentStatus(next);
      await updateOrderPaymentStatusAction({ orderId, paymentStatus: next });
      toast.success("Payment updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update payment");
      setPaymentStatus(props.paymentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Select
        value={status}
        onValueChange={(v) => onUpdateStatus(v as OrderStatus)}
        disabled={loading}>
        <SelectTrigger className="w-[190px] rounded-xl">
          <SelectValue placeholder="Order status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paymentStatus}
        onValueChange={(v) => onUpdatePayment(v as PaymentStatus)}
        disabled={loading}>
        <SelectTrigger className="w-[190px] rounded-xl">
          <SelectValue placeholder="Payment status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PaymentStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => window.print()}
        disabled={loading}>
        Print
      </Button>
    </div>
  );
}
