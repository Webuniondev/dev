import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatsPreview } from "@/components/user-stats-preview";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdministrationPage() {
  // Vérification côté serveur que l'utilisateur est admin
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("role_key")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role_key !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Administration</h1>
              <p className="text-gray-400 mt-2">
                Panneau d&apos;administration pour gérer l&apos;application
              </p>
            </div>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {/* Carte Gestion des utilisateurs */}
          <Link href="/administration/utilisateurs">
            <Card
              className="h-full cursor-pointer rounded-lg"
              style={{ backgroundColor: "#181818" }}
            >
              <CardHeader>
                <CardTitle className="text-gray-100">Gestion des utilisateurs</CardTitle>
                <CardDescription className="text-gray-400">
                  Voir et gérer tous les utilisateurs de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Interface pour consulter la liste des utilisateurs, modifier leurs rôles et
                    gérer les comptes.
                  </p>
                  <UserStatsPreview />
                  <div className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                    Cliquer pour accéder →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Carte Départements français */}
          <Link href="/administration/departements">
            <Card
              className="h-full cursor-pointer rounded-lg"
              style={{ backgroundColor: "#181818" }}
            >
              <CardHeader>
                <CardTitle className="text-gray-100">Départements français</CardTitle>
                <CardDescription className="text-gray-400">
                  Gestion des données de référence géographique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Gestion des 101 départements français, données de référence pour
                    l&apos;adressage des utilisateurs.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">101</div>
                      <div className="text-gray-300">départements</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">18</div>
                      <div className="text-gray-300">régions</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                    Cliquer pour accéder →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
