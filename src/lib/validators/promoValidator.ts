import { z } from "zod";

export const promoBannerTypeEnum = z.enum(["EVENT", "SPECIAL", "INFO"]);

export const promoBannerUpsertSchema = z
  .object({
    id: z.string().optional(),

    title: z
      .string()
      .min(2, "Title is required")
      .max(80, "Keep the title under 80 characters"),

    message: z
      .string()
      .min(2, "Message is required")
      .max(240, "Keep the message under 240 characters"),

    bannerType: promoBannerTypeEnum,

    imageUrl: z.string().url("Invalid image url").optional().nullable(),

    // We'll accept datetime-local values as string, convert in server action.
    startAt: z.string().optional().nullable(),
    endAt: z.string().optional().nullable(),

    showOnHome: z.boolean().default(true),
    showOnMenu: z.boolean().default(false),
    showOnEvents: z.boolean().default(false),

    isActive: z.boolean().default(true),

    backgroundColor: z
      .string()
      .optional()
      .nullable()
      .refine((v) => !v || /^#([0-9A-Fa-f]{3}){1,2}$/.test(v), {
        message: "Invalid color",
      }),

    textColor: z
      .string()
      .optional()
      .nullable()
      .refine((v) => !v || /^#([0-9A-Fa-f]{3}){1,2}$/.test(v), {
        message: "Invalid color",
      }),
  })
  .refine(
    (data) => {
      const hasStart = !!data.startAt;
      const hasEnd = !!data.endAt;
      if (!hasStart || !hasEnd) return true;

      const s = new Date(data.startAt!);
      const e = new Date(data.endAt!);
      return (
        Number.isFinite(s.getTime()) && Number.isFinite(e.getTime()) && e > s
      );
    },
    {
      message: "End time must be after start time",
      path: ["endAt"],
    },
  )
  .refine((data) => data.showOnHome || data.showOnMenu || data.showOnEvents, {
    message: "Select at least one placement (Home/Menu/Events).",
    path: ["showOnHome"],
  });

export type PromoBannerUpsertInput = z.infer<typeof promoBannerUpsertSchema>;
