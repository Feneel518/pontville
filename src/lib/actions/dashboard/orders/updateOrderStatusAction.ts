"use server";

import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(input: {
  orderId: string;
  status:
    | "NEW"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
}) {
  const updated = await prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
    select: {
      id: true,
      status: true,
      orderNo: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // broadcast to sockets (optional but recommended)
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/realtime/order-updated`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(updated),
    cache: "no-store",
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/kds");

  return updated;
}
