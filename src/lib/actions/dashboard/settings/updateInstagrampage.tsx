"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import {
  HomepageInput,
  homepageSchema,
  InstaInput,
  instaSchema,
} from "@/lib/validators/settingsValidator";
import { fail } from "assert";
import { revalidatePath } from "next/cache";

export async function updateInstagrampage(value: InstaInput) {
  await requireAuth();

  const parsed = instaSchema.safeParse(value);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");

  const id = await getSingletonId();

  await prisma.restaurant.update({ where: { id }, data: parsed.data });

  revalidatePath("/");

  return success("Home Page updated.");
}
