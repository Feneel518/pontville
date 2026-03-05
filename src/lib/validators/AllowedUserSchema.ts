import z from "zod";

export const allowedUSerSchema = z.object({
  email: z.email(),
});

export type AllowedUserSchemaRequest = z.infer<typeof allowedUSerSchema>;
