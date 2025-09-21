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
  address: z
    .string()
    .max(400)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  postal_code: z
    .string()
    .regex(/^[0-9A-Za-z\-\s]{3,12}$/)
    .optional(),
  city: z.string().max(160).optional(),
  department_code: z
    .string()
    .regex(/^(0[1-9]|[1-8][0-9]|9[0-5]|2[AB]|97[1-6])$/)
    .optional(),
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

// =====================================================
// Schémas PRO - Validation des profils professionnels
// =====================================================

// Secteur d'activité
export const proSectorSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type ProSectorInput = z.infer<typeof proSectorSchema>;

// Catégorie de service
export const proCategorySchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  sector_key: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
});

export type ProCategoryInput = z.infer<typeof proCategorySchema>;

// Profil professionnel complet (création)
export const proProfileCreateSchema = z.object({
  category_key: z.string().min(1, "La catégorie est obligatoire"),
  sector_key: z.string().min(1, "Le secteur est obligatoire"),
  business_name: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  description: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  experience_years: z
    .number()
    .int()
    .min(0, "L'expérience ne peut pas être négative")
    .max(50, "Maximum 50 ans d'expérience")
    .optional(),
});

export type ProProfileCreateInput = z.infer<typeof proProfileCreateSchema>;

// Mise à jour partielle du profil PRO
export const proProfileUpdateSchema = proProfileCreateSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Au moins un champ doit être modifié",
  });

export type ProProfileUpdateInput = z.infer<typeof proProfileUpdateSchema>;

// Validation de cohérence secteur/catégorie
export const proProfileValidationSchema = proProfileCreateSchema.refine(
  async () => {
    // Cette validation sera faite côté serveur avec la contrainte SQL
    // Ici on peut ajouter des validations supplémentaires si besoin
    return true;
  },
  {
    message: "La catégorie doit correspondre au secteur sélectionné",
  },
);

// Schéma pour la recherche de professionnels
export const proSearchSchema = z.object({
  category_key: z.string().optional(),
  sector_key: z.string().optional(),
  location: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ProSearchInput = z.infer<typeof proSearchSchema>;

// =====================================================
// Schémas pour les départements français
// =====================================================

// Département français
export const frenchDepartmentSchema = z.object({
  code: z.string().regex(/^(0[1-9]|[1-8][0-9]|9[0-5]|2[AB]|97[1-6])$/),
  name: z.string().min(1).max(100),
  region: z.string().min(1).max(100).optional(),
});

export type FrenchDepartmentInput = z.infer<typeof frenchDepartmentSchema>;

// Validation d'une adresse complète française
export const frenchAddressSchema = z.object({
  address: z.string().max(400).optional(),
  postal_code: z
    .string()
    .regex(/^[0-9A-Za-z\-\s]{3,12}$/)
    .optional(),
  city: z.string().max(160).optional(),
  department_code: z
    .string()
    .regex(/^(0[1-9]|[1-8][0-9]|9[0-5]|2[AB]|97[1-6])$/)
    .optional(),
});

export type FrenchAddressInput = z.infer<typeof frenchAddressSchema>;
