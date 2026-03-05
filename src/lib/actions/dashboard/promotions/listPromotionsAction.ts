"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";

export async function listPromoBannersAction() {
  await requireAuth();

  const banners = await prisma.promoBanner.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return banners;
}
