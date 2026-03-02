"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail } from "@/lib/helpers/ActionResultHelper";
import {
  createCategorySchema,
  CreateCategorySchemaRequest,
} from "@/lib/validators/categoryValidator";
import { getRestaurantId } from "../../global/getRestaurantd";
import { prisma } from "@/lib/prisma/db";
import { ensureUniqueSlug } from "@/lib/helpers/EnsureUniqueSlug";
import { revalidatePath } from "next/cache";

export const updateCategoryAction = async (
  value: CreateCategorySchemaRequest,
) => {
  await requireAuth();

  const parsed = createCategorySchema.safeParse(value);
  if (!parsed.success) {
    return fail("Invalid input, please check the data and try again. ");
  }

  const restaurantId = await getRestaurantId();
  const data = parsed.data;

  // Fetch current to compute slug if needed
  const current = await prisma.category.findFirst({
    where: { id: data.id, deletedAt: null },
    select: { id: true, name: true, slug: true },
  });

  if (!current) {
    return { ok: false as const, message: "Category not found." };
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
      slugFor: "category",
    });
  }

  await prisma.category.update({
    where: { id: data.id },
    data: {
      name: data.name,
      slug: nextSlug, // undefined => unchanged
      description: data.description ?? undefined,
      sortOrder: 1,
      menuId: data.menuId,
      status: data.status,
    },
  });

  revalidatePath(`/dashboard/menus/${data.menuId}`);
  return { ok: true as const, message: "Created Updated." };
};
