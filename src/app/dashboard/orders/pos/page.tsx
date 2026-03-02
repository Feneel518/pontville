import OrdersPosClient from "@/components/dashboard/orders/OrdersPosClient";
import { prisma } from "@/lib/prisma/db";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["NEW", "ACCEPTED", "PREPARING", "READY"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          menuItem: { select: { name: true } },
          itemVariant: { select: { name: true } },
        },
      },
    },
    take: 100,
  });
  return <OrdersPosClient initialOrders={orders} />;
};

export default page;
