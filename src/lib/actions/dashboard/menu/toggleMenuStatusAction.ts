"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";
import { getRestaurantId } from "../global/getRestaurantd";

export async function toggleMenuStatusAction(input: { id: string }) {
  await requireAuth();

  const restaurantId = await getRestaurantId();

  const row = await prisma.menu.findFirst({
    where: { id: input.id, restaurantId: restaurantId, deletedAt: null },
    select: { id: true, status: true },
  });

  if (!row) return { ok: false as const, message: "Menu not found." };

  const next = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.menu.update({
    where: { id: row.id },
    data: { status: next },
  });

  revalidatePath("/dashboard/menus");
  return { ok: true as const, status: next };
}
