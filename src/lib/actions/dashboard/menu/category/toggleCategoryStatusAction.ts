"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export async function toggleCategoryStatusAction(input: { id: string }) {
  await requireAuth();

  const row = await prisma.category.findFirst({
    where: { id: input.id, deletedAt: null },
    select: { id: true, status: true, menuId: true },
  });

  if (!row) return { ok: false as const, message: "Category not found." };

  const next = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.category.update({
    where: { id: row.id },
    data: { status: next },
  });

  revalidatePath(`/dashboard/menu/${row.menuId}`);
  return { ok: true as const, status: next };
}
