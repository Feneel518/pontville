"use server";

import { prisma } from "../prisma/db";

export async function ensureUniqueSlug(params: {
  restaurantId: string;
  baseSlug: string;
  excludeId?: string;
  slugFor: "menu" | "category" | "menuItem";
}) {
  const { restaurantId, baseSlug, excludeId } = params;

  // Try base slug first, then suffix -2, -3, ...
  let attempt = baseSlug;
  let i = 2;

  // eslint-disable-next-line no-constant-condition
  if (params.slugFor === "menu") {
    while (true) {
      const existing = await prisma.menu.findFirst({
        where: {
          restaurantId,
          slug: attempt,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!existing) return attempt;

      attempt = `${baseSlug}-${i}`;
      i++;
    }
  } else if (params.slugFor === "category") {
    while (true) {
      const existing = await prisma.category.findFirst({
        where: {
          slug: attempt,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!existing) return attempt;

      attempt = `${baseSlug}-${i}`;
      i++;
    }
  } else {
    return "";
  }
}
