"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import {
  EventFormSchema,
  EventFormValues,
} from "@/lib/validators/EventValidator";

import { revalidatePath } from "next/cache";

export const updateEventAction = async (values: EventFormValues) => {
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
    const response = await prisma.event.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.endDate !== undefined
          ? { endDate: data.endDate ? new Date(data.endDate) : null }
          : {}),
        ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
        ...(data.endTime !== undefined
          ? { endTime: data.endTime ? data.endTime : null }
          : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.highlight !== undefined
          ? { highlight: data.highlight ?? null }
          : {}),
        ...(data.ctaLabel !== undefined
          ? { ctaLabel: data.ctaLabel ?? null }
          : {}),
        ...(data.ctaHref !== undefined
          ? { ctaHref: data.ctaHref ?? null }
          : {}),
        ...(data.isTicketed !== undefined
          ? { isTicketed: data.isTicketed }
          : {}),
        ...(data.priceLabel !== undefined
          ? { priceLabel: data.priceLabel ?? null }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
      },
    });
    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return {
      ok: true as const,
      message: "Event created successfully.",
      data: response,
    };
  } catch (error: any) {


    return { ok: false, message: error.message, data: null };
  }
};
