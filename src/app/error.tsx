"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // On pourrait logguer vers Sentry automatiquement ici si besoin.
    // Sentry est déjà configuré via sentry-init et tunnel API.
    // console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
          <p className="text-muted-foreground">{error.message || "Erreur inconnue"}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => reset()}>Réessayer</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Retour à l’accueil
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
