"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";
import { revalidatePath } from "next/cache";

export async function toggleFeaturedAction(id: string, isFeatured: boolean) {
  await requireUser("reviews");

  const existing = await prisma.review.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false as const, error: "Review not found" };

  await prisma.review.update({ where: { id }, data: { isFeatured } });

  revalidatePath("/dashboard/reviews");
  revalidatePath("/");
  return { ok: true as const };
}
