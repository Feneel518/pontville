import { z } from "zod";

export const weekdayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const venueSchema = z.object({
  name: z.string().min(2).max(80),
  tagline: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().max(160).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(80).optional().or(z.literal("")),
  postcode: z.string().max(10).optional().or(z.literal("")),
});

export type VenueInput = z.infer<typeof venueSchema>;

// Hours editor schema (client)
export const hoursEditorSchema = z.object({
  bar: z.string().min(2, "Bar hours required"),
  bistroLunch: z.string().min(2, "Bistro Lunch hours required"),
  bistroDinner: z.string().min(2, "Bistro Dinner hours required"),
  tea: z.string().min(2, "Tea hours required"),
  notes: z.string().max(240).optional().or(z.literal("")),
  weeklyHolidays: z.array(weekdayEnum).default([]),
});

export type HoursEditorInput = z.infer<typeof hoursEditorSchema>;

export const brandSchema = z.object({
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const seoSchema = z.object({
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  allowIndexing: z.boolean(),
});

export type SeoInput = z.infer<typeof seoSchema>;

export const integrationsSchema = z.object({
  mapboxToken: z.string().max(200).optional().or(z.literal("")),
  mapLat: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Invalid latitude"),
  mapLng: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Invalid longitude"),
  uberEatsUrl: z.string().url().optional().or(z.literal("")),
  bookingUrl: z.string().url().optional().or(z.literal("")),
});

export type IntegrationsInput = z.infer<typeof integrationsSchema>;

export const homepageSchema = z.object({
  homepageMainImage: z.string().url().optional().or(z.literal("")).nullable(),
  homepageSideImage: z.string().url().optional().or(z.literal("")).nullable(),
  homePageBookATableImage: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export type HomepageInput = z.infer<typeof homepageSchema>;
export const instaSchema = z.object({
  insta1: z.string().url().optional().or(z.literal("")).nullable(),
  insta2: z.string().url().optional().or(z.literal("")).nullable(),
  insta3: z.string().url().optional().or(z.literal("")).nullable(),
  insta4: z.string().url().optional().or(z.literal("")).nullable(),
});

export type InstaInput = z.infer<typeof instaSchema>;
