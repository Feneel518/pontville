"use server";

import { prisma } from "@/lib/prisma/db";
import { isMenuOpenNow } from "../checks/isMenuOpenNow";

export async function getMenusOpenStateAction(menuIds: string[]) {
  const uniq = Array.from(new Set(menuIds.filter(Boolean)));
  if (uniq.length === 0) {
    return { ok: true as const, states: [] as const };
  }

  const menus = await prisma.menu.findMany({
    where: { id: { in: uniq }, deletedAt: null },
    select: {
      id: true,
      name: true,
      openingHours: {
        orderBy: [{ day: "asc" }, { openTime: "asc" }],
        select: { day: true, openTime: true, closeTime: true },
      },
    },
  });

  const now = new Date();

  const states = menus.map((m) => {
    const r = isMenuOpenNow({ openingHours: m.openingHours, now });
    return {
      menuId: m.id,
      menuName: m.name,
      isOpen: r.isOpen,
      opensAt: r.opensAt ?? null,
      closesAt: r.closesAt ?? null,
    };
  });

  // If some menuIds weren't found, treat them as closed for safety
  const found = new Set(states.map((s) => s.menuId));
  for (const id of uniq) {
    if (!found.has(id)) {
      states.push({
        menuId: id,
        menuName: "Unknown menu",
        isOpen: false,
        opensAt: null,
        closesAt: null,
      });
    }
  }

  return { ok: true as const, states };
}
