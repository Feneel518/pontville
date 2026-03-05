import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  notes: z.string().max(1000, "Too long").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
