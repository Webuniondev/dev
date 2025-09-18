import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600 mt-2">
          Panneau d&apos;administration pour gérer l&apos;application
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Voir et gérer tous les utilisateurs de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>
              Voir les statistiques d&apos;utilisation de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Paramètres généraux de l&apos;application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs et activité</CardTitle>
            <CardDescription>Consulter les logs et l&apos;activité récente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestion des contenus</CardTitle>
            <CardDescription>Modérer et gérer les contenus de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports</CardTitle>
            <CardDescription>Générer et consulter des rapports d&apos;activité</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Fonctionnalité à implémenter</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
