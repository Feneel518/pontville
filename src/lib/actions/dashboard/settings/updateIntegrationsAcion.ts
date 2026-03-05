"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail, success } from "@/lib/helpers/ActionResultHelper";
import { getSingletonId } from "@/lib/helpers/getSingletonId";

import { prisma } from "@/lib/prisma/db";
import {
  IntegrationsInput,
  integrationsSchema,
} from "@/lib/validators/settingsValidator";
import { revalidatePath } from "next/cache";

export async function updateIntegrationsAction(value: IntegrationsInput) {
  await requireAuth();
  const parsed = integrationsSchema.safeParse(value);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Invalid");

  const id = await getSingletonId();

  await prisma.restaurant.update({
    where: { id },
    data: {
      uberEatsUrl: parsed.data.uberEatsUrl || null,
      // store coordinates either as separate columns or embed in JSON;
      // here: embed in hoursJson OR create fields in schema.
      mapLat: parsed.data.mapLat ? Number(parsed.data.mapLat) : null,
      mapLng: parsed.data.mapLng ? Number(parsed.data.mapLng) : null,
    } as any,
  });
  revalidatePath("/events");
  return success("Integrations updated.");
}
