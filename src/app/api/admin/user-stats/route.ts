import { withApiProtection } from "@/lib/api-security";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

async function getUserStats() {
  try {
    const supabase = await supabaseServer({ readOnly: true });

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

    // Utiliser le client admin pour accéder à tous les utilisateurs
    const admin = supabaseAdmin();

    // Récupérer les statistiques
    const [totalUsersResult, activeUsersResult, proUsersResult, adminUsersResult] =
      await Promise.all([
        // Total utilisateurs
        admin.from("user_profile").select("user_id", { count: "exact", head: true }),

        // Utilisateurs actifs (connectés dans les 30 derniers jours)
        admin
          .from("user_profile")
          .select("user_id", { count: "exact", head: true })
          .gte("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Utilisateurs PRO
        admin
          .from("user_profile")
          .select("user_id", { count: "exact", head: true })
          .eq("role_key", "pro"),

        // Administrateurs
        admin
          .from("user_profile")
          .select("user_id", { count: "exact", head: true })
          .eq("role_key", "admin"),
      ]);

    if (totalUsersResult.error) {
      console.error("Erreur total users:", totalUsersResult.error);
      throw totalUsersResult.error;
    }

    if (activeUsersResult.error) {
      console.error("Erreur active users:", activeUsersResult.error);
      throw activeUsersResult.error;
    }

    if (proUsersResult.error) {
      console.error("Erreur pro users:", proUsersResult.error);
      throw proUsersResult.error;
    }

    if (adminUsersResult.error) {
      console.error("Erreur admin users:", adminUsersResult.error);
      throw adminUsersResult.error;
    }

    const stats = {
      total: totalUsersResult.count || 0,
      active: activeUsersResult.count || 0,
      pro: proUsersResult.count || 0,
      admin: adminUsersResult.count || 0,
    };

    return Response.json({
      success: true,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return Response.json(
      {
        error: "Erreur serveur lors de la récupération des statistiques",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

export const GET = withApiProtection(getUserStats);
