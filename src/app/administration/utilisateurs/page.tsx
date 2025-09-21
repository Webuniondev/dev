import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminActionsClient } from "@/components/admin-actions-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStats } from "@/components/user-stats";
import { UsersManagement } from "@/components/users-management";
import { supabaseServer } from "@/lib/supabase/server";

export default async function UtilisateursPage() {
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
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/administration"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Administration
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">Gestion des utilisateurs</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
              <p className="text-gray-400 mt-2">
                Voir et gérer tous les utilisateurs de la plateforme
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Statistiques utilisateurs */}
          <UserStats />

          {/* Actions rapides */}
          <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
            <CardHeader>
              <CardTitle className="text-gray-100">Actions rapides</CardTitle>
              <CardDescription className="text-gray-400">
                Outils de gestion des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-2 text-white rounded-md disabled:opacity-50"
                  style={{ backgroundColor: "#0f0f0f" }}
                  disabled
                >
                  Exporter la liste des utilisateurs
                </button>
                <AdminActionsClient />
                <button
                  className="w-full px-4 py-2 text-white rounded-md disabled:opacity-50"
                  style={{ backgroundColor: "#0f0f0f" }}
                  disabled
                >
                  Envoyer une notification groupée
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des utilisateurs */}
          <div className="lg:col-span-2">
            <UsersManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
