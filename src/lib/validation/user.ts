import { z } from "zod";

export const userSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80),
});

export type UserSignupInput = z.infer<typeof userSignupSchema>;

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;

// Profil utilisateur (upsert)
export const profileUpsertSchema = z.object({
  last_name: z.string().min(1).max(120),
  first_name: z.string().min(1).max(120),
  address: z.string().max(400).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  postal_code: z
    .string()
    .regex(/^[0-9A-Za-z\-\s]{3,12}$/)
    .optional(),
  city: z.string().max(160).optional(),
  phone_number: z
    .string()
    .regex(/^[0-9+().\-\s]{5,20}$/)
    .optional(),
  avatar_url: z.string().url().max(2048).optional(),
});

export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;

// Mise à jour partielle du profil (PATCH)
export const profilePartialUpdateSchema = profileUpsertSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: "Payload vide" });

export type ProfilePartialUpdateInput = z.infer<typeof profilePartialUpdateSchema>;
