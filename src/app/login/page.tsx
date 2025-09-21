import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInOAuthAction } from "@/app/actions/auth";
import { BackgroundBeams } from "@/components/ui/background-beams";
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
    // Déposer un cookie éphémère lisible côté client pour déclenchement du sonner
    const cookieStore = await cookies();
    cookieStore.set({ name: "welcome", value: "1", path: "/", maxAge: 15 });
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
    <main className="min-h-dvh relative overflow-hidden flex items-center">
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute -inset-[20%] bg-[radial-gradient(80rem_40rem_at_50%_10%,rgba(255,255,255,0.08),transparent_60%)]" />
        <BackgroundBeams />
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white/5 p-6 sm:p-8 backdrop-blur-md">
          <div className="mb-3">
            <Link href="/" className="inline-flex items-center gap-2 text-white text-sm">
              <ArrowLeft className="size-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black font-bold">
              A
            </div>
            <p className="text-white/80 text-sm">Ourspace</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-caveat font-bold text-white">
              <span className="inline-block">
                Connectez-vous à votre compte
                <span aria-hidden className="block mx-auto mt-2 w-1/2">
                  <svg className="w-full h-[4px]" viewBox="0 0 100 4" preserveAspectRatio="none">
                    <path
                      d="M0 2 Q 25 0 50 2 T 100 2"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-center text-sm text-red-300">{errorMessage}</p>
          ) : null}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form action={signInOAuthAction}>
              <input type="hidden" name="provider" value="github" />
              <Button
                type="submit"
                variant="secondary"
                className="w-full bg-white/10 text-white hover:bg-white/20"
              >
                <span className="inline-flex items-center gap-2">Login with GitHub</span>
              </Button>
            </form>
            <form action={signInOAuthAction}>
              <input type="hidden" name="provider" value="google" />
              <Button
                type="submit"
                variant="secondary"
                className="w-full bg-white/10 text-white hover:bg-white/20"
              >
                <span className="inline-flex items-center gap-2">Login with Google</span>
              </Button>
            </form>
          </div>

          <div className="my-6 h-px w-full bg-white/10" />

          <form action={signIn} className="space-y-4">
            <Button
              type="button"
              className="w-full justify-center bg-white text-black transition-none hover:bg-white hover:text-black cursor-default hover:cursor-default"
            >
              Continue with Email
            </Button>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vous@domaine.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-white">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
          <div className="mt-4 text-center text-white/80 text-sm">
            Pas de compte ?{" "}
            <Link href="/register" className="font-semibold hover:text-white">
              inscrivez vous maintenant !
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
