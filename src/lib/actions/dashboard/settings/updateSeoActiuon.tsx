"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail, success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import { SeoInput, seoSchema } from "@/lib/validators/settingsValidator";
import { revalidatePath } from "next/cache";

export async function updateSeoAction(value: SeoInput) {
  await requireAuth();
  const parsed = seoSchema.safeParse(value);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");
  const id = await getSingletonId();
  await prisma.restaurant.update({ where: { id }, data: parsed.data });

  revalidatePath("/events");
  return success("SEO updated.");
}
