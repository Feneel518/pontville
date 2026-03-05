"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { requireAuth } from "@/lib/checks/requireAuth";

export async function listReviewsAction() {
  await requireAuth();
  const restaurantId = await getRestaurantId();

  return prisma.review.findMany({
    orderBy: [
      { isFeatured: "desc" },
      { displayOrder: "asc" },
      { updatedAt: "desc" },
    ],
  });
}
