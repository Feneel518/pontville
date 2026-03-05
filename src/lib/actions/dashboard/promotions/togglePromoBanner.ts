"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export async function togglePromoBannerAction(id: string, isActive: boolean) {
  await requireAuth();

  const existing = await prisma.promoBanner.findFirst({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false as const, error: "Banner not found" };
  }

  await prisma.promoBanner.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  revalidatePath("/dashboard/promotions");

  return { ok: true as const };
}
