import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await supabaseServer();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Erreur échange de code:", error);
        redirect("/forgot-password?error=Lien invalide ou expiré");
      }

      // Vérifier si c'est un reset password
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Si l'utilisateur vient d'un lien de récupération, le diriger vers reset-password
        const isRecovery = searchParams.get("type") === "recovery" || next.includes("reset");

        if (isRecovery) {
          redirect("/reset-password?success=authenticated");
        }

        // Sinon, redirection normale
        redirect(next);
      }
    } catch (error) {
      console.error("Erreur callback auth:", error);
      redirect("/forgot-password?error=Erreur lors de l'authentification");
    }
  }

  redirect("/forgot-password?error=Code d'authentification manquant");
}
