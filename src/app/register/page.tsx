import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseServer } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabaseForCheck = await supabaseServer({ readOnly: true });
  const {
    data: { user: existingUser },
  } = await supabaseForCheck.auth.getUser();
  if (existingUser) {
    const cookieStore = await cookies();
    cookieStore.set({ name: "welcome", value: "1", path: "/", maxAge: 15 });
    redirect("/mon-espace");
  }

  async function signUp(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      redirect(`/register?error=${encodeURIComponent("Impossible de créer le compte")}`);
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
                Créez votre compte
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

          <form action={signUp} className="mt-6 space-y-4">
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
                  autoComplete="new-password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              S&apos;inscrire
            </Button>
          </form>

          <div className="mt-4 text-center text-white/80 text-sm">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold hover:text-white">
              connectez-vous
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
