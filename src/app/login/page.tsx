import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = (await searchParams) || {};
  const errorMessage = typeof sp.error === "string" ? sp.error : undefined;

  // Rediriger si déjà connecté
  const supabaseForCheck = await supabaseServer({ readOnly: true });
  const {
    data: { user: existingUser },
  } = await supabaseForCheck.auth.getUser();
  if (existingUser) {
    redirect("/mon-espace");
  }

  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/login?error=${encodeURIComponent("Identifiants invalides")}`);
    }
    // Assurer l'existence d'un profil minimal (first_name/last_name) pour l'affichage
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const userMeta = user.user_metadata as Record<string, unknown> | null | undefined;
      const fullName: string | undefined = (userMeta?.full_name as string) || undefined;
      let firstName: string | undefined = (userMeta?.first_name as string) || undefined;
      let lastName: string | undefined = (userMeta?.last_name as string) || undefined;
      if (!firstName && fullName) {
        const parts = String(fullName).split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ") || undefined;
      }
      // Créer la ligne si absente
      const { data: existing } = await supabase
        .from("user_profile")
        .select("user_id, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        await supabase
          .from("user_profile")
          .upsert({ user_id: user.id, first_name: firstName ?? null, last_name: lastName ?? null })
          .select("user_id")
          .single();
      }
    }
    redirect("/mon-espace");
  }

  return (
    <main className="container mx-auto max-w-md px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold mb-6">Connexion</h1>
      {errorMessage ? (
        <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <form action={signIn} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@domaine.com" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full">Se connecter</Button>
      </form>
    </main>
  );
}


