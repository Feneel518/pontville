"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export const updateEventStatusAction = async (
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) => {
  await requireAuth();

  if (!id) {
    return {
      ok: false,
      message: "No Event Id received to update Status.",
    };
  }

  try {
     await prisma.event.update({ where: { id }, data: { status } });

     revalidatePath("/events");
     revalidatePath("/dashboard/events");
     return { ok: true as const, message:`Event status updated to ${status}`};
  } catch (error:any) {
       return { ok: false, message: error.message };
  }
};
