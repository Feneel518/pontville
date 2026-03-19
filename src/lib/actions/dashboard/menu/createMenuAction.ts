"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail } from "@/lib/helpers/ActionResultHelper";
import { ensureUniqueSlug } from "@/lib/helpers/EnsureUniqueSlug";

import { slugify } from "@/lib/helpers/SlugHelper";
import { prisma } from "@/lib/prisma/db";
import {
  CreateMenuInput,
  createMenuSchema,
} from "@/lib/validators/menuValidator";
import { get } from "http";
import { revalidatePath } from "next/cache";
import { getRestaurantId } from "../global/getRestaurantd";

export const createMenuAction = async (value: CreateMenuInput) => {
  await requireAuth();

  const parsed = createMenuSchema.safeParse(value);
  if (!parsed.success) {
    return fail("Invalid input, please check the data and try again. ");
  }

  const restaurantId = await getRestaurantId();
  const data = parsed.data;
  const baseSlug = data.slug ?? slugify(data.name);

  const slug = await ensureUniqueSlug({
    restaurantId: restaurantId,
    baseSlug,
    slugFor: "menu",
  });

  // ✅ flatten schedules -> rows
  const openingHoursRows = (data.schedules ?? []).flatMap((d) => {
    if (d.isClosed) {
      return [
        {
          day: d.day,
          slot: 0,
          isClosed: true,
          openTime: "00:00",
          closeTime: "00:00",
        },
      ];
    }

    return (d.slots ?? []).map((s, idx) => ({
      day: d.day,
      slot: idx,
      isClosed: false,
      openTime: s.openTime,
      closeTime: s.closeTime,
    }));
  });

  const created = await prisma.$transaction(async (tx) => {
    const menu = await tx.menu.create({
      data: {
        restaurantId,
        name: data.name,
        slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? "ACTIVE",
      },
      select: { id: true },
    });

    if (openingHoursRows.length > 0) {
      await tx.menuOpeningHour.createMany({
        data: openingHoursRows.map((r) => ({
          menuId: menu.id,
          day: r.day,
          slot: r.slot,
          isClosed: r.isClosed,
          openTime: r.openTime,
          closeTime: r.closeTime,
        })),
      });
    }

    return menu;
  });

  revalidatePath("/dashboard/menus");
  revalidatePath("/menu");
  return { ok: true as const, message: "Menu Created.", id: created.id };
};
