import Link from "next/link";
import { redirect } from "next/navigation";

import { DepartmentsList } from "@/components/departments-list";
import { supabaseServer } from "@/lib/supabase/server";

export default async function DepartementsPage() {
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
            <span className="text-white">Départements</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Départements français</h1>
              <p className="text-gray-400 mt-2">Gestion des données de référence géographique</p>
            </div>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <DepartmentsList />
      </div>
    </div>
  );
}
