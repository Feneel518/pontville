"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import {
  HoursEditorInput,
  hoursEditorSchema,
} from "@/lib/validators/settingsValidator";
import { fail } from "assert";
import { revalidatePath } from "next/cache";

export async function updateHoursAction(value: HoursEditorInput) {
  await requireAuth();
  const parsed = hoursEditorSchema.safeParse(value);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");

  const EXCLUDE_KEYS = ["notes"];

  const filtered = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => !EXCLUDE_KEYS.includes(key)),
  );

  const id = await getSingletonId();
  await prisma.restaurant.update({
    where: { id },
    data: {
      hoursJson: filtered as any,
      weeklyHolidays: parsed.data.weeklyHolidays,
    },
  });

  revalidatePath("/events");
  return success("Trading hours updated.");
}
