import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withApiProtection } from "@/lib/api-security";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Schémas de validation
const baseRegistrationSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  first_name: z.string().min(1, "Le prénom est requis").max(120),
  last_name: z.string().min(1, "Le nom est requis").max(120),
  phone_number: z.string().min(1).optional().or(z.literal("")),
  department_code: z.string().min(2).max(3).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

const userRegistrationSchema = baseRegistrationSchema.extend({
  account_type: z.literal("user"),
});

const proRegistrationSchema = baseRegistrationSchema.extend({
  account_type: z.literal("pro"),
  category_key: z.string().min(1, "La catégorie est requise"),
  sector_key: z.string().min(1, "Le secteur est requis"),
  business_name: z.string().optional(),
  description: z.string().optional(),
  experience_years: z.number().int().min(0).max(50).optional(),
});

const registrationSchema = z.discriminatedUnion("account_type", [
  userRegistrationSchema,
  proRegistrationSchema,
]);

async function registerUser(request: NextRequest) {
  try {
    const admin = supabaseAdmin();

    // Valider les données
    const body = await request.json();
    const validationResult = registrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Vérifier que l'email n'existe pas déjà
    const { data: usersList, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 10 });
    if (listError) {
      console.error("Erreur liste utilisateurs:", listError);
      return NextResponse.json(
        { error: "Erreur lors de la vérification de l'email" },
        { status: 500 },
      );
    }

    const emailExists = usersList.users.some((user) => user.email === data.email);
    if (emailExists) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 },
      );
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Email confirmé automatiquement
      user_metadata: {
        first_name: data.first_name,
        last_name: data.last_name,
        account_type: data.account_type,
        created_at: new Date().toISOString(),
      },
    });

    if (authError || !authUser.user) {
      console.error("Erreur création auth user:", authError);
      return NextResponse.json(
        {
          error: "Erreur lors de la création du compte",
          details: authError?.message,
        },
        { status: 500 },
      );
    }

    try {
      if (data.account_type === "user") {
        // Inscription utilisateur simple
        const { error: profileError } = await admin.from("user_profile").insert({
          user_id: authUser.user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number:
            data.phone_number && data.phone_number.trim() ? data.phone_number.trim() : null,
          department_code: data.department_code || null,
          address: data.address || null,
          city: data.city || null,
          postal_code: data.postal_code || null,
          role_key: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          throw new Error(`Erreur création profil utilisateur: ${profileError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: "Compte utilisateur créé avec succès",
          data: {
            user_id: authUser.user.id,
            email: authUser.user.email,
            account_type: "user",
            created_at: authUser.user.created_at,
          },
        });
      } else {
        // Inscription professionnelle - flux simple en trois étapes
        // 1) Créer le user_profile (rôle temporaire 'user' pour éviter le trigger)
        const { error: profileInsertError } = await admin.from("user_profile").insert({
          user_id: authUser.user.id,
          role_key: "user",
          last_name: data.last_name,
          first_name: data.first_name,
          phone_number:
            data.phone_number && data.phone_number.trim() ? data.phone_number.trim() : null,
          department_code: data.department_code || null,
          address: data.address || null,
          city: data.city || null,
          postal_code: data.postal_code || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileInsertError) {
          throw new Error(`Erreur création profil utilisateur: ${profileInsertError.message}`);
        }

        // 2) Créer le pro_profile (catégorie/secteur requis)
        const { error: proInsertError } = await admin.from("pro_profile").insert({
          user_id: authUser.user.id,
          category_key: data.category_key,
          sector_key: data.sector_key,
          business_name: data.business_name || null,
          description: data.description || null,
          experience_years: data.experience_years || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (proInsertError) {
          throw new Error(`Erreur création profil PRO: ${proInsertError.message}`);
        }

        // 3) Passer le rôle du profil en 'pro' (le trigger vérifiera la présence du pro_profile)
        const { error: roleError } = await admin
          .from("user_profile")
          .update({ role_key: "pro", updated_at: new Date().toISOString() })
          .eq("user_id", authUser.user.id);

        if (roleError) {
          throw new Error(`Erreur mise à jour rôle PRO: ${roleError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: "Compte professionnel créé avec succès",
          data: {
            user_id: authUser.user.id,
            email: authUser.user.email,
            account_type: "pro",
            category_key: data.category_key,
            sector_key: data.sector_key,
            created_at: authUser.user.created_at,
          },
        });
      }
    } catch (profileError) {
      console.error("Erreur création profil:", profileError);

      // Rollback : supprimer l'utilisateur auth créé
      await admin.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        {
          error: "Erreur lors de la création du profil",
          details: profileError instanceof Error ? profileError.message : "Erreur inconnue",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur lors de l'inscription",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

export const POST = withApiProtection(registerUser);
