import { NextRequest } from "next/server";
import { z } from "zod";

import { withApiProtection } from "@/lib/api-security";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

// Schema de validation pour la création d'admin
const createAdminSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  first_name: z.string().min(1, "Le prénom est requis").max(120),
  last_name: z.string().min(1, "Le nom est requis").max(120),
  phone_number: z.string().min(1).optional().or(z.literal("")),
});

async function createAdmin(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const admin = supabaseAdmin();

    // Vérifier que l'utilisateur appelant est admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profile")
      .select("role_key")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.role_key !== "admin") {
      return Response.json({ error: "Accès non autorisé - Rôle admin requis" }, { status: 403 });
    }

    // Valider les données
    const body = await request.json();
    const validationResult = createAdminSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          error: "Données invalides",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { email, password, first_name, last_name, phone_number } = validationResult.data;

    // Vérifier que l'email n'existe pas déjà

    // Utiliser listUsers pour vérifier l'unicité (plus sûr avec l'API admin)
    const { data: usersList, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      console.error("Erreur liste utilisateurs:", listError);
      return Response.json(
        { error: "Erreur lors de la vérification des utilisateurs existants" },
        { status: 500 },
      );
    }

    const emailExists = usersList.users.some((user) => user.email === email);
    if (emailExists) {
      return Response.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 });
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email confirmé automatiquement
      user_metadata: {
        first_name,
        last_name,
        created_by_admin: user.id,
        created_at: new Date().toISOString(),
      },
    });

    if (authError || !authUser.user) {
      console.error("Erreur création auth user:", authError);
      return Response.json(
        {
          error: "Erreur lors de la création de l'utilisateur",
          details: authError?.message,
        },
        { status: 500 },
      );
    }

    // Créer le profil utilisateur avec le rôle admin
    const { error: profileError } = await admin.from("user_profile").insert({
      user_id: authUser.user.id,
      first_name,
      last_name,
      phone_number: phone_number && phone_number.trim() ? phone_number.trim() : null,
      role_key: "admin", // Définir directement comme admin
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Erreur création profil:", profileError);

      // En cas d'erreur, supprimer l'utilisateur auth créé
      await admin.auth.admin.deleteUser(authUser.user.id);

      return Response.json(
        {
          error: "Erreur lors de la création du profil utilisateur",
          details: profileError.message,
        },
        { status: 500 },
      );
    }

    // Récupérer les données complètes du nouvel admin
    const { data: newAdminProfile, error: fetchError } = await admin
      .from("user_profile")
      .select(
        `
        user_id,
        first_name,
        last_name,
        phone_number,
        role_key,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", authUser.user.id)
      .single();

    if (fetchError) {
      console.error("Erreur récupération profil:", fetchError);
    }

    return Response.json({
      success: true,
      message: `Administrateur ${first_name} ${last_name} créé avec succès`,
      data: {
        user_id: authUser.user.id,
        email: authUser.user.email,
        profile: newAdminProfile,
        created_by: user.id,
        created_at: authUser.user.created_at,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    return Response.json(
      {
        error: "Erreur serveur lors de la création",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

export const POST = withApiProtection(createAdmin);
