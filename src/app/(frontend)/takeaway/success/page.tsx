import SuccessComponent from "@/components/frontend/SuccessComponent";
import { requireUser } from "@/lib/checks/requireUser";
import { prisma } from "@/lib/prisma/db";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const { orderId } = await searchParams;

  const session = await requireUser("orders");

  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          addOns: true,
        },
      },
    },
  });

  if (!order) notFound();

  //   🔒 Ensure user owns this order
  if (order.userId !== session.user.id) {
    notFound();
  }

  return (
    <SuccessComponent order={order}></SuccessComponent>
    // <SectionComponent className="max-w-2xl mx-auto">
    //   <PaidConfetti fire={order.paymentStatus === "PAID"} />
    //   {/* <PostPaymentActions
    //     paid={order.paymentStatus === "PAID"}
    //     redirectTo={`/orders?orderId=${order.id}`}
    //   /> */}
    //   <Card>
    //     <CardHeader>
    //       <CardTitle>
    //         {order.paymentStatus === "PAID"
    //           ? "Order Confirmed 🎉"
    //           : "Confirming Payment..."}
    //       </CardTitle>
    //     </CardHeader>

    //     <CardContent className="space-y-4">
    //       {order.paymentStatus !== "PAID" && (
    //         <div className="text-sm text-muted-foreground">
    //           We're confirming your payment. This may take a few seconds. Please
    //           do not close this page.
    //         </div>
    //       )}

    //       <Separator />

    //       <div className="space-y-2">
    //         <div className="flex justify-between text-sm">
    //           <span>Order #</span>
    //           <span className="font-medium">{order.orderNo}</span>
    //         </div>

    //         <div className="flex justify-between text-sm">
    //           <span>Name</span>
    //           <span>{order.customerName}</span>
    //         </div>

    //         <div className="flex justify-between text-sm">
    //           <span>Pickup Time</span>
    //           <span>
    //             {order.pickupTime
    //               ? new Date(order.pickupTime).toLocaleString()
    //               : "ASAP"}
    //           </span>
    //         </div>
    //       </div>

    //       <Separator />

    //       <div className="space-y-3">
    //         {order.items.map((item) => (
    //           <div key={item.id} className="space-y-1">
    //             <div className="flex justify-between font-medium">
    //               <span>
    //                 {item.snapshotItemName}
    //                 {item.snapshotVariantName
    //                   ? ` (${item.snapshotVariantName})`
    //                   : ""}
    //                 {" × "}
    //                 {item.quantity}
    //               </span>
    //               <span>{formatUsd(item.lineTotal)}</span>
    //             </div>

    //             {item.addOns.length > 0 && (
    //               <div className="ml-4 text-xs text-muted-foreground space-y-1">
    //                 {item.addOns.map((a) => (
    //                   <div key={a.id}>+ {a.snapshotAddOnName}</div>
    //                 ))}
    //               </div>
    //             )}
    //           </div>
    //         ))}
    //       </div>

    //       <Separator />

    //       <div className="flex justify-between font-semibold">
    //         <span>Total</span>
    //         <span>{formatUsd(order.total)}</span>
    //       </div>
    //     </CardContent>
    //   </Card>

    //   {order.paymentStatus !== "PAID" && (
    //     <meta httpEquiv="refresh" content="3" />
    //   )}
    // </SectionComponent>
  );
};

export default page;
