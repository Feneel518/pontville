"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

import { revalidatePath } from "next/cache";
import {
  ReviewUpsertInput,
  reviewUpsertSchema,
} from "@/lib/validators/reviewValidator";

export async function createReviewAction(input: ReviewUpsertInput) {
  await requireUser("reviews");
  const restaurantId = await getRestaurantId();

  const parsed = reviewUpsertSchema.omit({ id: true }).safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.flatten() };

  const d = parsed.data;

  const created = await prisma.review.create({
    data: {
      authorName: d.authorName,
      authorPhoto: d.authorPhoto ?? null,
      rating: d.rating,
      message: d.message,
      source: d.source,
      isFeatured: d.isFeatured,
      displayOrder: d.displayOrder,
    },
  });

  revalidatePath("/dashboard/reviews");
  revalidatePath("/"); // if reviews show on home
  return { ok: true as const, data: created };
}
