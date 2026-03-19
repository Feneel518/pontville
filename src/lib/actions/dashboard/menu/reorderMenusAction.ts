"use server";

import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export async function reorderMenusAction(menuIds: string[]) {
  if (!Array.isArray(menuIds) || menuIds.length === 0) {
    throw new Error("No menus provided for reorder.");
  }

  await prisma.$transaction(
    menuIds.map((id, index) =>
      prisma.menu.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath("/dashboard/menu");

  return { success: true };
}
