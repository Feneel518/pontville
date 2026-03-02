"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail, success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import { VenueInput, venueSchema } from "@/lib/validators/settingsValidator";

export async function updateVenueAction(value: VenueInput) {
  await requireAuth();
  const parsed = venueSchema.safeParse(value);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");
  const id = await getSingletonId();
  await prisma.restaurant.update({ where: { id }, data: parsed.data });
  return success("Venue updated.");
}
