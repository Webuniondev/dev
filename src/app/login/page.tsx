import { ArrowLeft, Github, Mail } from "lucide-react";
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
  const successMessage = typeof sp.success === "string" ? sp.success : undefined;

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
        <div className="mx-auto w-full max-w-lg rounded-2xl relative isolate overflow-hidden backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/8 bg-white/15 border border-white/20 ring-1 ring-inset ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 sm:p-8 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-transparent before:opacity-40 before:content-[''] after:pointer-events-none after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:opacity-80 after:content-['']">
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

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-400/30">
              <p className="text-green-300 text-sm text-center">{successMessage}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form action={signInOAuthAction}>
              <input type="hidden" name="provider" value="github" />
              <Button
                type="submit"
                variant="secondary"
                className="w-full bg-white/10 text-white hover:bg-white/20"
              >
                <span className="inline-flex items-center gap-2">
                  <Github className="size-4" />
                  Se connecter avec GitHub
                </span>
              </Button>
            </form>
            <form action={signInOAuthAction}>
              <input type="hidden" name="provider" value="google" />
              <Button
                type="submit"
                variant="secondary"
                className="w-full bg-white/10 text-white hover:bg-white/20"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Se connecter avec Google
                </span>
              </Button>
            </form>
          </div>

          <div className="my-6 h-px w-full bg-white/10" />

          <form action={signIn} className="space-y-4">
            <Button
              type="button"
              className="w-full justify-center bg-white text-black transition-none hover:bg-white hover:text-black cursor-default hover:cursor-default"
            >
              <Mail className="size-4 mr-2" />
              Continuer avec l&apos;email
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
                <div className="pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
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
