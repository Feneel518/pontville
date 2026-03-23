import { badgeVariants } from "@/components/ui/badge";
import { z } from "zod";

const inquiryBase = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().optional().or(z.literal("")),
  notes: z.string().max(1000, "Too long").optional().or(z.literal("")),
});

export const createTableInquirySchema = inquiryBase.extend({
  type: z.literal("TABLE"),

  guests: z.coerce
    .number()
    .int()
    .min(1, "Minimum 1 guest")
    .max(50, "Max 50 guests"),
  bookingAt: z.date({ error: "Booking Date is requred." }),
});

export const createEventInquirySchema = inquiryBase.extend({
  type: z.literal("EVENT"),

  eventType: z.string().min(2, "Event type is required"),
  eventDate: z.date({ error: "Event Date is required." }),

  expectedGuests: z
    .union([z.coerce.number().int().min(1).max(1000), z.nan()])
    .optional()
    .transform((v) =>
      typeof v === "number" && Number.isFinite(v) ? v : undefined,
    ),
  budget: z
    .union([z.coerce.number().int().min(0).max(1_000_000_000), z.nan()])
    .optional()
    .transform((v) =>
      typeof v === "number" && Number.isFinite(v) ? v : undefined,
    ),
});

export const createInquirySchema = z.discriminatedUnion("type", [
  createTableInquirySchema,
  createEventInquirySchema,
]);

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
