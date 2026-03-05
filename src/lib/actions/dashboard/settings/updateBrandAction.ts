"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import { BrandInput, brandSchema } from "@/lib/validators/settingsValidator";
import { fail } from "assert";
import { revalidatePath } from "next/cache";

export async function updateBrandAction(value: BrandInput) {
  await requireAuth();

  const parsed = brandSchema.safeParse(value);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");

  const id = await getSingletonId();

  await prisma.restaurant.update({ where: { id }, data: parsed.data });

  revalidatePath("/events");

  return success("Brand & social updated.");
}
