"use client";

import * as React from "react";

import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  onReady?: () => void;
  onError?: (message: string) => void;
};

export function ResetRecoveryBridge({ onReady, onError }: Props) {
  React.useEffect(() => {
    const run = async () => {
      try {
        const supabase = supabaseBrowser();

        // Si une session est déjà active, rien à faire
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          onReady?.();
          return;
        }

        // Extraire les paramètres depuis l'URL (search + hash)
        const url = new URL(window.location.href);
        const type = url.searchParams.get("type") || "recovery";
        const code = url.searchParams.get("code");

        // Le token peut apparaître en "token", "token_hash" ou dans le fragment (#access_token)
        let token: string | undefined = undefined;
        const t1 = url.searchParams.get("token");
        const t2 = url.searchParams.get("token_hash");
        token = (t1 !== null ? t1 : undefined) || (t2 !== null ? t2 : undefined);
        if (!token) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const h1 = hash.get("access_token");
          const h2 = hash.get("token");
          token = (h1 !== null ? h1 : undefined) || (h2 !== null ? h2 : undefined);
        }

        if (!token) {
          onError?.("Lien invalide. Veuillez demander un nouveau lien de réinitialisation.");
          return;
        }

        // 0) Si un code OAuth/PKCE est présent, échanger le code pour une session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            onReady?.();
            return;
          }
        }

        // 1) Si des jetons sont présents dans le hash, établir la session directement
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            onReady?.();
            return;
          }
        }

        // 2) Essayer d'établir une session à partir du token (token_hash lien email, sinon OTP court)
        let ok = false;

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as "recovery",
          });
          if (!error && data.session) ok = true;
        } catch {
          // Ignore error for fallback
        }

        if (!ok) {
          // Fallback: certains environnements renvoient un token court (OTP)
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token: token as string,
              type: type as "recovery",
              email: "",
            });
            if (!error && data.session) ok = true;
          } catch {
            // Ignore error
          }
        }

        if (!ok) {
          onError?.(
            "Ce lien de réinitialisation a expiré ou a déjà été utilisé. Veuillez demander un nouveau lien.",
          );
          return;
        }

        onReady?.();
      } catch {
        onError?.("Erreur inattendue lors de la validation du lien.");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
