"use server";

import { prisma } from "@/lib/prisma/db";

export const getMenuById = async (id: string) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id },
      select: {
        openingHours: true,
        categories: {
          select: { id: true, name: true, slug: true },
          orderBy: { sortOrder: "asc" }, // if exists
        },
      },
    });

     const categories = menu?.categories;

    return { ok: true, menu , categories};
  } catch (error) {
    return { ok: false };
  }
};
