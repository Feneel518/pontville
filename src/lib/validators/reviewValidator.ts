import { z } from "zod";

export const reviewSourceEnum = z.enum(["GOOGLE", "WEBSITE"]);

export const reviewUpsertSchema = z.object({
  id: z.string().optional(),

  authorName: z.string().min(2, "Name is required").max(60),
  authorPhoto: z.string().url("Invalid photo URL").optional().nullable(),

  rating: z.coerce.number().int().min(1).max(5),

  message: z.string().min(5, "Review is too short").max(500),

  source: reviewSourceEnum.default("GOOGLE"),

  isFeatured: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type ReviewUpsertInput = z.infer<typeof reviewUpsertSchema>;
