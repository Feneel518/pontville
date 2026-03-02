import z from "zod";
import { slugify } from "../helpers/SlugHelper";

export const CategoryStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const createCategorySchema = z.object({
  id: z.string().optional(),
  menuId: z.string(),
  name: z.string().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .optional()
    .transform((v) => (v ? slugify(v) : undefined)),
  description: z.string().max(500).optional().nullable(),
  status: CategoryStatusEnum.optional().default("ACTIVE"),
});

export type CreateCategorySchemaRequest = z.infer<typeof createCategorySchema>;
