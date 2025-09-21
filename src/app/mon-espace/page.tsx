import { redirect } from "next/navigation";

import { AvatarUploader } from "@/components/avatar-uploader";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MonEspacePage() {
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }
  const { data: prof } = await supabase
    .from("user_profile")
    .select("avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();
  return (
    <main className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Mon espace</h1>
        <p className="text-muted-foreground">Gestion de votre profil utilisateur</p>
      </div>

      <div className="space-y-8">
        {/* Section Avatar */}
        <section>
          <h2 className="text-xl font-medium mb-4">📷 Avatar</h2>
          <AvatarUploader initialUrl={prof?.avatar_url ?? null} />
        </section>

        {/* Section Informations personnelles */}
        <section>
          <h2 className="text-xl font-medium mb-4">👤 Informations personnelles</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-muted-foreground">
              Gestion du profil utilisateur à implémenter (nom, prénom, adresse, etc.)
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
