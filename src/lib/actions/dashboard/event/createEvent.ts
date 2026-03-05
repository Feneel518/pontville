"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import {
  EventFormSchema,
  EventFormValues,
} from "@/lib/validators/EventValidator";

import { revalidatePath } from "next/cache";

export const createEventAction = async (values: EventFormValues) => {
  await requireAuth();

  const parsed = EventFormSchema.safeParse(values);

  if (!parsed.success || parsed.error) {
    return {
      ok: false,
      message: "Enter all the fields properly.",
    };
  }

  const data = parsed.data;

  try {
    await prisma.event.create({
      data: {
        title: data.title,
        type: data.type,

        image: data.image,
        // if schema is ISO string:
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,

        description: data.description,
        highlight: data.highlight ?? null,
        ctaLabel: data.ctaLabel ?? null,
        ctaHref: data.ctaHref ?? null,

        isTicketed: data.isTicketed,
        priceLabel: data.isTicketed ? (data.priceLabel ?? null) : null,

        status: data.status,
        sortOrder: data.sortOrder,
      },
    });
    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return { ok: true, message: "Event created successfully." };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
};
