import z from "zod";
import { slugify } from "../helpers/SlugHelper";

export const MenuStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const WeekDayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const timeHHmm = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format (e.g. 09:30)");

const timeToMinutes = (t: string) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};

export const MenuTimeSlotSchema = z
  .object({
    openTime: timeHHmm,
    closeTime: timeHHmm,
  })
  .superRefine((val, ctx) => {
    const open = timeToMinutes(val.openTime);
    const close = timeToMinutes(val.closeTime);

    if (close <= open) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Close time must be after open time",
        path: ["closeTime"],
      });
    }
  });

export const MenuDayScheduleSchema = z
  .object({
    day: WeekDayEnum,
    isClosed: z.boolean().default(false),
    slots: z.array(MenuTimeSlotSchema).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.isClosed && val.slots.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "If the day is closed, slots must be empty",
        path: ["slots"],
      });
    }

    if (!val.isClosed && val.slots.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one slot or mark the day as closed",
        path: ["slots"],
      });
    }

    const sorted = [...val.slots].sort(
      (a, b) => timeToMinutes(a.openTime) - timeToMinutes(b.openTime),
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const aEnd = timeToMinutes(sorted[i].closeTime);
      const bStart = timeToMinutes(sorted[i + 1].openTime);

      if (bStart < aEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Time slots cannot overlap",
          path: ["slots", i + 1, "openTime"],
        });
      }
    }
  });

export const createMenuSchema = z.object({
  id: z.string().optional(),

  name: z.string().trim().min(2, "Name is required").max(120),

  slug: z.preprocess((val) => {
    if (val === "" || val == null) return undefined;
    return slugify(String(val));
  }, z.string().max(140).optional()),

  description: z.preprocess((val) => {
    if (val === "") return null;
    return val;
  }, z.string().max(500).nullable().optional()),

  imageUrl: z.preprocess((val) => {
    if (val === "") return null;
    return val;
  }, z.string().url("Please upload a valid image").nullable().optional()),

  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),

  status: MenuStatusEnum.optional().default("ACTIVE"),

  schedules: z.array(MenuDayScheduleSchema).default([]),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
