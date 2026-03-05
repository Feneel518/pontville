// import Link from "next/link";
// import { prisma } from "@/lib/prisma/db";
// import { requireUser } from "@/lib/checks/requireUser";
// import SectionComponent from "@/components/global/SectionComponent";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatUsd } from "@/lib/helpers/formatCurrency";

// function statusBadgeVariant(
//   status:
//     | "NEW"
//     | "ACCEPTED"
//     | "PREPARING"
//     | "READY"
//     | "COMPLETED"
//     | "CANCELLED",
// ) {
//   switch (status) {
//     case "NEW":
//       return "secondary";
//     case "ACCEPTED":
//     case "PREPARING":
//       return "default";
//     case "READY":
//       return "secondary";
//     case "COMPLETED":
//       return "outline";
//     case "CANCELLED":
//       return "destructive";
//     default:
//       return "secondary";
//   }
// }

// function paymentBadgeVariant(
//   ps: "UNPAID" | "REQUIRES_ACTION" | "PAID" | "FAILED" | "REFUNDED",
// ) {
//   switch (ps) {
//     case "PAID":
//       return "default";
//     case "UNPAID":
//     case "REQUIRES_ACTION":
//       return "secondary";
//     case "FAILED":
//       return "destructive";
//     case "REFUNDED":
//       return "outline";
//     default:
//       return "secondary";
//   }
// }

// export default async function OrdersPage() {
//   const session = await requireUser("orders");

//   const orders = await prisma.order.findMany({
//     where: { userId: session.user.id },
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       orderNo: true,
//       createdAt: true,
//       status: true,
//       paymentStatus: true,
//       total: true,
//       pickupTime: true,
//       restaurant: { select: { name: true } },
//     },
//     take: 50,
//   });

//   return (
//     <SectionComponent className="max-w-5xl mx-auto">
//       <Card className="rounded-2xl">
//         <CardHeader className="flex flex-row items-center justify-between gap-3">
//           <CardTitle>My Orders</CardTitle>

//           <Button asChild variant="outline" className="rounded-xl">
//             <Link href="/menu">Order again</Link>
//           </Button>
//         </CardHeader>

//         <CardContent>
//           {orders.length === 0 ? (
//             <div className="text-sm text-muted-foreground">
//               No orders yet. Go to the menu and place your first takeaway order.
//             </div>
//           ) : (
//             <div className="rounded-xl border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order</TableHead>
//                     <TableHead>Restaurant</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Payment</TableHead>
//                     <TableHead>Pickup</TableHead>
//                     <TableHead className="text-right">Total</TableHead>
//                     <TableHead className="text-right">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {orders.map((o) => (
//                     <TableRow key={o.id}>
//                       <TableCell>
//                         <div className="font-medium">#{o.orderNo}</div>
//                         <div className="text-xs text-muted-foreground">
//                           {new Date(o.createdAt).toLocaleString()}
//                         </div>
//                       </TableCell>

//                       <TableCell className="text-sm">
//                         {o.restaurant?.name ?? "-"}
//                       </TableCell>

//                       <TableCell>
//                         <Badge
//                           variant={statusBadgeVariant(o.status)}
//                           className="rounded-full">
//                           {o.status}
//                         </Badge>
//                       </TableCell>

//                       <TableCell>
//                         <Badge
//                           variant={paymentBadgeVariant(o.paymentStatus)}
//                           className="rounded-full">
//                           {o.paymentStatus}
//                         </Badge>
//                       </TableCell>

//                       <TableCell className="text-sm">
//                         {o.pickupTime
//                           ? new Date(o.pickupTime).toLocaleString()
//                           : "ASAP"}
//                       </TableCell>

//                       <TableCell className="text-right font-semibold">
//                         {formatUsd(o.total)}
//                       </TableCell>

//                       <TableCell className="text-right">
//                         <Button asChild size="sm" className="rounded-xl">
//                           <Link href={`/orders/${o.id}`}>View</Link>
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </SectionComponent>
//   );
// }

import OrdersGrid from "@/components/frontend/order/OrdersGrid";
import OrdersPagination from "@/components/frontend/order/OrdersPagination";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { requireUser } from "@/lib/checks/requireUser";
import { pageMetadata } from "@/lib/helpers/seo";
import { prisma } from "@/lib/prisma/db";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { FC } from "react";

interface pageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = pageMetadata({
  title: "Online Orders",
  description:
    "Order takeaway online from The Pontville Pub. Fast checkout and easy pickup in Pontville, Tasmania.",
  path: "/orders",
});
const TAKE = 12;

function toInt(v: unknown, fallback: number) {
  const n = typeof v === "string" ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const sp = (await searchParams) ?? {};

  const page = toInt(sp.page, 1);

  const skip = (page - 1) * TAKE;

  const session = await requireUser("orders");

  const where: Prisma.OrderWhereInput = {
    userId: session.user.id,
  };
  const [totalCount, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: TAKE,
      select: {
        id: true,
        orderNo: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        total: true,
        customerName: true,
        pickupTime: true,
        restaurant: { select: { name: true, slug: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            snapshotItemName: true,
            snapshotVariantName: true,
            lineTotal: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / TAKE));

  return (
    <SectionComponent>
      <div className="flex items-end justify-between gap-4">
        <Heading label="Your Orders" />
        <div className="text-sm text-muted-foreground">
          Page {page} / {totalPages} • {totalCount} orders
        </div>
      </div>

      <div className="mt-6">
        <OrdersGrid orders={orders} />
      </div>

      <div className="mt-8">
        <OrdersPagination page={page} totalPages={totalPages} />
      </div>
    </SectionComponent>
  );
};

export default page;
