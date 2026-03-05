"use server";

import { prisma } from "@/lib/prisma/db";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

export type PromoPlacement = "HOME" | "MENU" | "EVENTS";

export async function getActivePromoBannersAction(placement: PromoPlacement) {
  const now = new Date();

  const wherePlacement =
    placement === "HOME"
      ? { showOnHome: true }
      : placement === "MENU"
        ? { showOnMenu: true }
        : { showOnEvents: true };

  const banners = await prisma.promoBanner.findMany({
    where: {
      isActive: true,
      ...wherePlacement,
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return banners;
}
