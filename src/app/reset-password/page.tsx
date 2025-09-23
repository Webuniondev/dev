import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/reset-password-form";
import { ResetRecoveryBridge } from "@/components/reset-recovery-bridge";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const sp = (await searchParams) || {};
  const error = typeof sp.error === "string" ? sp.error : undefined;

  async function updatePassword(formData: FormData) {
    "use server";

    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    // Validations côté serveur (sécurité)
    if (!password || !confirmPassword) {
      redirect("/reset-password?error=Tous les champs sont requis");
    }

    // Validation côté serveur (sécurité)
    if (password.length < 8) {
      redirect("/reset-password?error=Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/[A-Z]/.test(password)) {
      redirect("/reset-password?error=Le mot de passe doit contenir au moins une majuscule");
    }

    if (!/[0-9]/.test(password)) {
      redirect("/reset-password?error=Le mot de passe doit contenir au moins un chiffre");
    }

    if (password !== confirmPassword) {
      redirect("/reset-password?error=Les mots de passe ne correspondent pas");
    }

    const supabase = await supabaseServer();
    // Mettre à jour le mot de passe (Supabase établira la session via le lien si besoin)
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Erreur update password:", updateError);

      // Gérer spécifiquement l'erreur "même mot de passe"
      if (
        (updateError as { code?: string })?.code === "same_password" ||
        updateError.message?.includes("should be different from the old password")
      ) {
        redirect(
          "/reset-password?error=Le nouveau mot de passe doit être différent de l'ancien mot de passe.",
        );
      }

      // Autres erreurs
      redirect("/reset-password?error=Erreur lors de la mise à jour du mot de passe");
    }

    // Déconnecter l'utilisateur après la mise à jour pour qu'il se reconnecte
    await supabase.auth.signOut();

    redirect("/login?success=Mot de passe mis à jour avec succès. Veuillez vous reconnecter.");
  }

  return (
    <main className="min-h-dvh relative overflow-hidden flex items-center">
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute -inset-[20%] bg-[radial-gradient(80rem_40rem_at_50%_10%,rgba(255,255,255,0.08),transparent_60%)]" />
        <BackgroundBeams />
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto w-full max-w-lg rounded-2xl relative isolate overflow-hidden backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/8 bg-white/15 border border-white/20 ring-1 ring-inset ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 sm:p-8 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-transparent before:opacity-40 before:content-[''] after:pointer-events-none after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:opacity-80 after:content-['']">
          {/* Bridge client pour établir la session depuis le lien de récupération */}
          <ResetRecoveryBridge />
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white text-sm hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Retour à la connexion
            </Link>
          </div>

          <div className="text-center mb-6">
            <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black font-bold">
              O
            </div>
            <p className="text-white/80 text-sm">Ourspace</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-caveat font-bold text-white">
              <span className="inline-block">
                Nouveau mot de passe
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

          <div className="text-center mb-6">
            <p className="text-white/70 text-sm">
              Créez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <ResetPasswordForm onSubmit={updatePassword} />

          <div className="mt-6 text-center text-white/80 text-sm">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link href="/login" className="font-semibold hover:text-white transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
