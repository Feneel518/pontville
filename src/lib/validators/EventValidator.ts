import { z } from "zod";

export const EventStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const EventFormSchema = z
  .object({
    id: z.uuid().optional(),
    title: z.string().min(2, "Title is required"),
    type: z.string().min(2, "Type is required"),
    status: EventStatusEnum.default("DRAFT"),
    image: z.url().optional(),

    // calendar dates (Date objects)
    startDate: z.date(),
    endDate: z.date().optional().nullable(),

    // time inputs: "HH:mm" 24-hour (from <input type="time" />)
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:mm"),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "End time must be HH:mm")
      .optional()
      .nullable(),

    description: z.string().min(10, "Description is required"),
    highlight: z.string().optional().nullable(),

    ctaLabel: z.string().optional().nullable(),
    ctaHref: z.string().optional().nullable(),

    isTicketed: z.boolean().default(false),
    priceLabel: z.string().optional().nullable(),

    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .refine(
    (val) => {
      // if endDate exists, endTime should exist
      if (val.endDate && !val.endTime) return false;
      // if endTime exists, endDate should exist (we allow same day endDate auto in UI, but schema expects date)
      if (val.endTime && !val.endDate) return false;
      return true;
    },
    {
      message: "End date/time must be provided together",
      path: ["endTime"],
    },
  );

export type EventFormValues = z.infer<typeof EventFormSchema>;
