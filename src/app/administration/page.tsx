import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  // Prévisualisation Secteurs & Catégories (SSR)
  const { count: sectorsCount } = await supabase
    .from("pro_sector")
    .select("*", { count: "exact", head: true });
  const { count: categoriesCount } = await supabase
    .from("pro_category")
    .select("*", { count: "exact", head: true });

  // Prévisualisation Utilisateurs (SSR) avec client admin pour bypass RLS
  const admin = supabaseAdmin();
  const [{ count: totalUsers }, { count: activeUsers }] = await Promise.all([
    admin.from("user_profile").select("user_id", { count: "exact", head: true }),
    admin
      .from("user_profile")
      .select("user_id", { count: "exact", head: true })
      .gte("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Administration</h1>
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
            <Card className="h-full cursor-pointer rounded-lg" style={{ backgroundColor: "#181818" }}>
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
                  {/* Aperçu SSR chiffré pour éviter le flash */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">{totalUsers ?? 0}</div>
                      <div className="text-gray-300">Total utilisateurs</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">{activeUsers ?? 0}</div>
                      <div className="text-gray-300">Actifs (30j)</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                    Cliquer pour accéder →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Carte Secteurs & catégories */}
          <Link href="/administration/secteurs" className="block h-full">
            <Card className="h-full cursor-pointer rounded-lg" style={{ backgroundColor: "#181818" }}>
              <CardHeader>
                <CardTitle className="text-gray-100">Secteurs & catégories</CardTitle>
                <CardDescription className="text-gray-400">Vue d&apos;ensemble des secteurs d&apos;activité</CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col">
                <div className="space-y-4">
                  <p className="text-gray-300">Accéder au résumé des secteurs et au détail par secteur.</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">{sectorsCount ?? 0}</div>
                      <div className="text-gray-300">secteurs</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                      <div className="text-3xl font-bold text-white">{categoriesCount ?? 0}</div>
                      <div className="text-gray-300">catégories</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-auto flex items-center gap-1">Cliquer pour accéder →</div>
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
