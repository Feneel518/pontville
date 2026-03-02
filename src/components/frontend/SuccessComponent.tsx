"use client";

import Image from "next/image";
import { FC, useEffect, useState } from "react";
import ArrowButton from "../ui/ArrowButton";
import SectionComponent from "../global/SectionComponent";
import Heading from "../global/Heading";
import PaidConfetti from "../global/PaidConfetti";
import { Separator } from "../ui/separator";
import { formatUsd } from "@/lib/helpers/formatCurrency";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart.store";

interface SuccessComponentProps {
  order: Prisma.OrderGetPayload<{
    include: {
      items: {
        include: {
          addOns: true;
        };
      };
    };
  }>;
}

const SuccessComponent: FC<SuccessComponentProps> = ({ order }) => {
  const router = useRouter();
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds === 0) {
      router.push("/orders");
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, router]);

  const clear = useCartStore((s) => s.clear);
  const isPaid = order.paymentStatus === "PAID";
  useEffect(() => {
    if (isPaid) {
      clear();
    }
  }, [isPaid, clear]);
  return (
    <SectionComponent className="">
      <PaidConfetti fire={order.paymentStatus === "PAID"} />
      <div className="grid gap-12 md:pt-20 md:grid-cols-2">
        <aside className="flex flex-col justify-between">
          <div className="md:max-w-[80%] space-y-4">
            <Heading
              label={
                order.paymentStatus === "PAID"
                  ? "Order Confirmed 🎉"
                  : "Confirming Payment..."
              }></Heading>

            <div>
              {order.paymentStatus !== "PAID" && (
                <div className="text-sm text-muted-foreground">
                  We're confirming your payment. This may take a few seconds.
                  Please do not close this page.
                </div>
              )}
            </div>
            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Order #</span>
                <span className="font-medium">{order.orderNo}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Name</span>
                <span>{order.customerName}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Pickup Time</span>
                <span>
                  {order.pickupTime
                    ? new Date(order.pickupTime).toLocaleString()
                    : "ASAP"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>
                      {item.snapshotItemName}
                      {item.snapshotVariantName
                        ? ` (${item.snapshotVariantName})`
                        : ""}
                      {" × "}
                      {item.quantity}
                    </span>
                    <span>{formatUsd(item.lineTotal)}</span>
                  </div>

                  {item.addOns.length > 0 && (
                    <div className="ml-4 text-xs text-muted-foreground space-y-1">
                      {item.addOns.map((a) => (
                        <div key={a.id}>+ {a.snapshotAddOnName}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatUsd(order.total)}</span>
            </div>

            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold">Payment Successful</h1>
              <p className="text-muted-foreground mt-2">
                Redirecting in {seconds} seconds...
              </p>
            </div>
          </div>
          {/* Desktop CTA */}
          <div className="hidden md:block mt-20">
            <ArrowButton
              href={`/order/${order.id}`}
              direction="right"
              label="Go to order"
            />
          </div>
        </aside>
        <aside className="grid grid-cols-2 gap-4 md:items-end md:gap-12">
          <div className="relative aspect-4/5 w-full md:aspect-4/5">
            <Image
              src="/mainImage.jpg"
              alt="About The Crown Inn"
              fill
              className="object-cover rounded-sm"
            />
          </div>

          <div className="relative aspect-square w-full ">
            <Image
              src="/sideImage.jpg"
              alt="The Crown Inn interior"
              fill
              className="object-cover rounded-sm"
            />
          </div>
        </aside>
      </div>
      <div className="md:hidden  ">
        <ArrowButton
          href={`/order/${order.id}`}
          direction="right"
          label="Go to order"
        />
      </div>
    </SectionComponent>
  );
};

export default SuccessComponent;
