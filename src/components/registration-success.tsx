"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface RegistrationSuccessProps {
  accountType: "user" | "pro";
}

export function RegistrationSuccess({ accountType }: RegistrationSuccessProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-green-500/20">
          <CheckCircle className="size-12 text-green-400" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Compte créé avec succès !</h2>
        <p className="text-white/70">
          {accountType === "pro"
            ? "Votre compte professionnel est maintenant actif"
            : "Votre compte utilisateur est maintenant actif"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-white/60 text-sm">
          Vous pouvez maintenant vous connecter et accéder à votre espace personnel
        </p>

        <Button asChild className="w-full">
          <Link href="/login">Se connecter</Link>
        </Button>

        <Button variant="outline" asChild className="w-full">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>

      {accountType === "pro" && (
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-purple-300 text-sm">
            💼 En tant que professionnel, vous pouvez maintenant compléter votre profil et commencer
            à recevoir des demandes de clients.
          </p>
        </div>
      )}
    </div>
  );
}
