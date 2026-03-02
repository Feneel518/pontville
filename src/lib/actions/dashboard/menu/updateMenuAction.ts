"use server";

import { fail } from "@/lib/helpers/ActionResultHelper";
import { ensureUniqueSlug } from "@/lib/helpers/EnsureUniqueSlug";
import { prisma } from "@/lib/prisma/db";
import {
  CreateMenuInput,
  createMenuSchema,
} from "@/lib/validators/menuValidator";
import { revalidatePath } from "next/cache";
import { getRestaurantId } from "../global/getRestaurantd";

export async function updateMenuAction(value: CreateMenuInput) {
  // await requireAuth();

  const parsed = createMenuSchema.safeParse(value);
  if (!parsed.success) {
    return fail("Invalid input, please check the data and try again. ");
  }

  const restaurantId = await getRestaurantId();
  const data = parsed.data;

  // Fetch current to compute slug if needed
  const current = await prisma.menu.findFirst({
    where: { id: data.id, restaurantId: restaurantId, deletedAt: null },
    select: { id: true, name: true, slug: true },
  });

  if (!current) {
    return { ok: false as const, message: "Menu not found." };
  }

  let nextSlug: string | undefined = undefined;
  const nameChanged =
    typeof data.name === "string" && data.name !== current.name;

  // If slug provided, use it (unique). If name changed and slug not provided, keep slug as-is (stable URLs).
  if (data.slug) {
    nextSlug = await ensureUniqueSlug({
      restaurantId: restaurantId,
      baseSlug: data.slug,
      excludeId: data.id,
      slugFor: "menu",
    });
  }
  const openingHoursRows = (data.schedules ?? [])
    .filter((d) => !d.isClosed)
    .flatMap((d) =>
      (d.slots ?? []).map((s, idx) => ({
        day: d.day,
        slot: idx,
        openTime: s.openTime,
        closeTime: s.closeTime,
      })),
    );

  await prisma.$transaction(async (tx) => {
    // ✅ ensure menu belongs to restaurant
    const menu = await tx.menu.findFirst({
      where: { id: data.id, restaurantId },
      select: { id: true },
    });
    if (!menu) throw new Error("Menu not found.");

    await tx.menu.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? "ACTIVE",
      },
    });

    // ✅ replace opening hours
    await tx.menuOpeningHour.deleteMany({
      where: { menuId: data.id },
    });

    if (openingHoursRows.length > 0) {
      await tx.menuOpeningHour.createMany({
        data: openingHoursRows.map((r) => ({
          menuId: data.id!,
          day: r.day,
          slot: r.slot,
          openTime: r.openTime,
          closeTime: r.closeTime,
        })),
      });
    }
  });

  revalidatePath("/dashboard/menus");
  revalidatePath("/menu");
  return { ok: true as const, message: "Menu Updated." };
}
