"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import { revalidatePath } from "next/cache";

export const deleteEventAction = async (id: string) => {
  await requireAuth();

  if (!id) {
    return {
      ok: false,
      message: "No Event Id received to delete.",
    };
  }

  try {
    await prisma.event.delete({ where: { id } });

    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return { ok: true as const, message: "Event deleted Successfully" };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
};
