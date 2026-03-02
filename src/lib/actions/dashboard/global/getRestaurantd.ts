import { prisma } from "@/lib/prisma/db";
import { redirect } from "next/navigation";

export async function getRestaurantId(): Promise<string> {
  const restaurantId = await prisma.restaurant.findFirst({});

  if (!restaurantId) redirect("/"); // or /dashboard/select-restaurant
  return restaurantId.id;
}
