import { notFound } from "next/navigation";
import Link from "next/link";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import { prisma } from "@/lib/prisma/db";
import OrderDetailsView from "@/components/frontend/order/OrderDetailsView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNo: true,
      orderKey: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      updatedAt: true,

      customerName: true,
      customerPhone: true,
      pickupTime: true,
      notes: true,

      subtotal: true,
      tax: true,
      packingFee: true,
      total: true,

      stripeReceiptUrl: true,
      stripeCheckoutSessionId: true,
      stripePaymentIntentId: true,

      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
          addressLine: true,
        },
      },

      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,

          snapshotCategoryName: true,
          snapshotItemName: true,
          snapshotVariantName: true,
          snapshotMenuId: true,

          unitBasePrice: true,
          unitAddOnsPrice: true,
          unitTotalPrice: true,
          lineTotal: true,

          addOns: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              snapshotGroupName: true,
              snapshotAddOnName: true,

              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  return (
    <SectionComponent>
      <div className="flex items-end justify-between gap-4">
        <Heading label={`Order #${String(order.orderNo).padStart(4, "0")}`} />
        <Link
          href="/orders"
          className="text-sm text-muted-foreground hover:underline">
          Back to Orders
        </Link>
      </div>

      <div className="mt-6">
        <OrderDetailsView order={order} />
      </div>
    </SectionComponent>
  );
}
