import { NextRequest } from "next/server";
import { z } from "zod";

import { withApiProtection } from "@/lib/api-security";
import { supabaseServer } from "@/lib/supabase/server";

// Schema de validation pour la mise à jour du rôle
const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role_key: z.enum(["user", "pro", "admin"]),
});

async function updateUserRole(request: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Vérifier que l'utilisateur est admin
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
      return Response.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Valider les données
    const body = await request.json();
    const validationResult = updateUserRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          error: "Données invalides",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { userId, role_key } = validationResult.data;

    // Empêcher un admin de se rétrograder lui-même
    if (userId === user.id && role_key !== "admin") {
      return Response.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle d'administrateur" },
        { status: 400 },
      );
    }

    // Mettre à jour le rôle via la fonction RPC
    const { data: updateResult, error: updateError } = await supabase.rpc(
      "admin_update_user_role",
      {
        target_user_id: userId,
        new_role_key: role_key,
      },
    );

    if (updateError) {
      console.error("Erreur lors de la mise à jour du rôle:", updateError);
      throw updateError;
    }

    return Response.json({
      success: true,
      message: `Rôle utilisateur mis à jour avec succès`,
      data: updateResult,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    return Response.json(
      {
        error: "Erreur serveur lors de la mise à jour",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

export const POST = withApiProtection(updateUserRole);
