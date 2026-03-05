import z from "zod";

export const PriceTypeEnum = z.enum(["SIMPLE", "VARIANT"]);
export const PublishStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export const AddOnSelectionEnum = z.enum(["SINGLE", "MULTI"]);

export const ItemVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  price: z.coerce
    .number()
    .int("Price must be an integer (dollars)")
    .min(0, "Price cannot be negative"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type ItemVariantSchemaRequest = z.infer<typeof ItemVariantSchema>;

export const AddOnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  price: z.coerce
    .number()
    .int("Price must be an integer (dollars)")
    .min(0, "Price cannot be negative"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const AddOnGroupSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1).max(120),
    selection: AddOnSelectionEnum.default("MULTI"),
    minSelect: z.number().int().min(0).default(0),
    maxSelect: z.number().int().min(1).optional().nullable(), // null => unlimited
    sortOrder: z.number().int().min(0).default(0),
    addOns: z.array(AddOnSchema).default([]),
  })
  .superRefine((val, ctx) => {
    // maxSelect >= minSelect (if maxSelect provided)
    if (val.maxSelect != null && val.maxSelect < val.minSelect) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxSelect"],
        message: "maxSelect must be >= minSelect",
      });
    }
    // SINGLE selection: maxSelect must be 1 (and minSelect 0 or 1)
    if (val.selection === "SINGLE") {
      if (val.maxSelect != null && val.maxSelect !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxSelect"],
          message: "For SINGLE selection, maxSelect must be 1",
        });
      }
      if (val.minSelect > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minSelect"],
          message: "For SINGLE selection, minSelect can be 0 or 1",
        });
      }
    }
  });

export type AddOnSchemaRequest = z.infer<typeof AddOnGroupSchema>;

export const MenuItemSchema = z
  .object({
    id: z.string().optional(),
    categoryId: z.string(),

    name: z.string().min(1).max(160),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
      .optional(), // you can generate on server if omitted
    description: z.string().max(2000).optional().nullable(),
    imageUrl: z.string().optional().nullable(),

    priceType: PriceTypeEnum.default("SIMPLE"),
    basePrice: z.coerce
      .number()
      .int("Price must be an integer (dollars)")
      .min(0, "Price cannot be negative")
      .optional()
      .nullable(),

    status: PublishStatusEnum.default("ACTIVE"),
    isAvailable: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),
    variants: z.array(ItemVariantSchema).default([]),
    addOnGroups: z.array(AddOnGroupSchema).default([]),
    isVeg: z.boolean().default(true),
    isVegan: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if (val.priceType === "SIMPLE") {
      if (!val.basePrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["basePrice"],
          message: "Base price is required for SIMPLE items",
        });
      }
    }

    if (val.priceType === "VARIANT") {
      if (val.basePrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["basePrice"],
          message: "Base price must be empty for VARIANT items",
        });
      }
    }
  });

export type MenuItemSchemaRequest = z.infer<typeof MenuItemSchema>;
