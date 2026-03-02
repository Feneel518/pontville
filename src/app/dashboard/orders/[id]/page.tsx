import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/requireUser";
import OrderDetailsView from "@/components/dashboard/orders/OrderDetailsView";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { requireAuth } from "@/lib/checks/requireAuth";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Missing restaurantId in session");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, email: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          addOns: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!order) notFound();
  // ✅ Tenant safety: never allow reading other restaurant's orders
  if (order.restaurantId !== restaurantId) notFound();

  return <OrderDetailsView order={order as any} />;
}
