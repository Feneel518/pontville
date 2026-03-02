"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail } from "@/lib/helpers/ActionResultHelper";
import { ensureUniqueSlug } from "@/lib/helpers/EnsureUniqueSlug";
import { slugify } from "@/lib/helpers/SlugHelper";
import {
  createCategorySchema,
  CreateCategorySchemaRequest,
} from "@/lib/validators/categoryValidator";
import { getRestaurantId } from "../../global/getRestaurantd";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export const createCategoryAction = async (
  value: CreateCategorySchemaRequest,
) => {
  await requireAuth();

  const parsed = createCategorySchema.safeParse(value);
  if (!parsed.success) {
    return fail("Invalid input, please check the data and try again. ");
  }
  const restaurantId = await getRestaurantId();
  const data = parsed.data;
  const baseSlug = data.slug ?? slugify(data.name);

  const slug = await ensureUniqueSlug({
    restaurantId: restaurantId,
    baseSlug,
    slugFor: "category",
  });

  const created = await prisma.category.create({
    data: {
      name: data.name,
      slug: slug,
      description: data.description,
      menuId: data.menuId,
      status: data.status ?? "ACTIVE",
      sortOrder: 0,
    },
    select: {
      id: true,
    },
  });
  revalidatePath(`/dashboard/menus/${data.menuId}`);
  return { ok: true as const, message: "Category Created.", id: created.id };
};
