"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import { BrandInput, brandSchema } from "@/lib/validators/settingsValidator";
import { fail } from "assert";

export async function updateBrandAction(value: BrandInput) {
  await requireAuth();

  const parsed = brandSchema.safeParse(value);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");

  const id = await getSingletonId();

  await prisma.restaurant.update({ where: { id }, data: parsed.data });

  return success("Brand & social updated.");
}
