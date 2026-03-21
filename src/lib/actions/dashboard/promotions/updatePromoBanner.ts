"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/requireUser";
import { getRestaurantId } from "@/lib/actions/dashboard/global/getRestaurantd";

import { revalidatePath } from "next/cache";
import {
  PromoBannerUpsertInput,
  promoBannerUpsertSchema,
} from "@/lib/validators/promoValidator";
import { requireAuth } from "@/lib/checks/requireAuth";
import { PromoBannerType } from "@prisma/client";

function toDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : null;
}

export async function updatePromoBannerAction(input: PromoBannerUpsertInput) {
  await requireAuth();

  const parsed = promoBannerUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const data = parsed.data;
  if (!data.id) {
    return {
      ok: false as const,
      error: { formErrors: ["Missing banner id"], fieldErrors: {} },
    };
  }

  // Ensure banner belongs to restaurant
  const existing = await prisma.promoBanner.findFirst({
    where: { id: data.id },
    select: { id: true },
  });
  if (!existing) {
    return {
      ok: false as const,
      error: { formErrors: ["Banner not found"], fieldErrors: {} },
    };
  }

  const updated = await prisma.promoBanner.update({
    where: { id: data.id },
    data: {
      title: data.title,
      message: data.message,
      bannerType: data.bannerType as PromoBannerType,
      imageUrl: data.imageUrl,
      startAt: toDateOrNull(data.startAt),
      endAt: toDateOrNull(data.endAt),

      showOnHome: data.showOnHome,
      showOnMenu: data.showOnMenu,
      showOnEvents: data.showOnEvents,

      isActive: data.isActive,

      backgroundColor: data.backgroundColor ?? null,
      textColor: data.textColor ?? null,
    },
  });



  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/events");
  revalidatePath("/dashboard/promotions");

  return { ok: true as const, data: updated };
}
