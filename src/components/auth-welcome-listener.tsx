"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function AuthWelcomeListener() {
  const displayName = useAuthStore((s) => s.displayName);
  const email = useAuthStore((s) => s.email);
  const shownRef = useRef(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      const userId = user?.id;

      // Si pas d'utilisateur (après déconnexion ou au chargement initial sans session), nettoyer
      if (!userId) {
        try {
          sessionStorage.removeItem("welcomed_user_id");
        } catch {}
        // Autoriser un nouveau toast lors de la prochaine connexion
        shownRef.current = false;
        return;
      }

      // Déclencher à la connexion explicite OU à la première session chargée après redirection
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;
      if (shownRef.current) return;

      let alreadyWelcomed = false;
      try {
        alreadyWelcomed = sessionStorage.getItem("welcomed_user_id") === userId;
      } catch {}
      if (alreadyWelcomed) return;

      const meta = (user.user_metadata as Record<string, unknown> | null) || null;
      const metaName =
        (typeof meta?.full_name === "string" && meta.full_name) ||
        [meta?.first_name, meta?.last_name].filter(Boolean).join(" ") ||
        null;
      const name = displayName || metaName || user.email || email || "Utilisateur";
      shownRef.current = true;
      try {
        sessionStorage.setItem("welcomed_user_id", userId);
      } catch {}
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Bonjour, {name} !</span>
          <span className="text-sm opacity-90">Ravi de vous revoir !</span>
        </div>,
      );
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [displayName, email]);

  return null;
}


