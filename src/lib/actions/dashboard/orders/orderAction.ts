"use server";

import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "../global/getRestaurantd";

async function assertCanAccessOrder(orderId: string) {
  const session = await requireUser("orders");
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, restaurantId: true },
  });

  if (!order || order.restaurantId !== restaurantId) {
    throw new Error("Not allowed");
  }

  return { restaurantId };
}

export async function updateOrderStatusAction(args: {
  orderId: string;
  status: OrderStatus;
}) {
  await assertCanAccessOrder(args.orderId);

  await prisma.order.update({
    where: { id: args.orderId },
    data: { status: args.status },
  });

  revalidatePath(`/dashboard/orders/${args.orderId}`);
  revalidatePath(`/dashboard/orders`);
}

export async function updateOrderPaymentStatusAction(args: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  await assertCanAccessOrder(args.orderId);

  await prisma.order.update({
    where: { id: args.orderId },
    data: { paymentStatus: args.paymentStatus },
  });

  revalidatePath(`/dashboard/orders/${args.orderId}`);
  revalidatePath(`/dashboard/orders`);
}
