"use server";

import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

type ReorderPayload = {
  id: string;
  sortOrder: number;
}[];

export async function reorderMenusAction(payload: ReorderPayload) {
  if (!payload.length) return { success: true };

  await prisma.$transaction(
    payload.map((item) =>
      prisma.menu.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard/menu/reorder");

  return { success: true };
}
