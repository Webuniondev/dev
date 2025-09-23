import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const sp = (await searchParams) || {};
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const success = typeof sp.success === "string" ? sp.success : undefined;

  async function resetPasswordRequest(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim();

    if (!email) {
      redirect("/forgot-password?error=Email requis");
    }

    // Validation basique email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      redirect("/forgot-password?error=Format d'email invalide");
    }

    const supabase = await supabaseServer();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Suivre la doc Supabase: le template doit utiliser {{ .ConfirmationURL }}
      // Ici on ne construit PAS le lien nous-mêmes.
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      console.error("Erreur reset password:", error);
      console.error("Error details:", {
        message: error.message,
        code: (error as { code?: string })?.code,
        status: (error as { status?: number })?.status,
        timestamp: new Date().toISOString(),
      });

      // Gérer spécifiquement l'erreur de limite de taux
      if (
        error.message?.includes("For security purposes, you can only request this after") ||
        (error as { code?: string })?.code === "over_email_send_rate_limit" ||
        error.message?.includes("over_email_send_rate_limit")
      ) {
        redirect(
          "/forgot-password?error=Vous devez attendre avant de demander un nouveau lien. Veuillez patienter quelques minutes pour des raisons de sécurité.",
        );
      }

      // Erreur email non trouvé (mais on ne le dit pas pour la sécurité)
      if (
        error.message?.includes("Unable to validate email address") ||
        error.message?.includes("Invalid email")
      ) {
        redirect("/forgot-password?success=email-sent");
      }

      // Autres erreurs
      redirect("/forgot-password?error=Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    }

    redirect("/forgot-password?success=email-sent");
  }

  return (
    <main className="min-h-dvh relative overflow-hidden flex items-center">
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute -inset-[20%] bg-[radial-gradient(80rem_40rem_at_50%_10%,rgba(255,255,255,0.08),transparent_60%)]" />
        <BackgroundBeams />
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto w-full max-w-lg rounded-2xl relative isolate overflow-hidden backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/8 bg-white/15 border border-white/20 ring-1 ring-inset ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 sm:p-8 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-transparent before:opacity-40 before:content-[''] after:pointer-events-none after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:opacity-80 after:content-['']">
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
                Mot de passe oublié ?
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

          {success === "email-sent" ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-400/30">
                <Mail className="size-12 mx-auto mb-3 text-green-400" />
                <h2 className="text-xl font-semibold text-white mb-2">Email envoyé !</h2>
                <p className="text-white/80 text-sm">
                  Nous avons envoyé un lien de réinitialisation à votre adresse email. Vérifiez
                  votre boîte de réception et suivez les instructions.
                </p>
                <p className="text-white/60 text-xs mt-3">
                  Le lien expire dans 1 heure. Pensez à vérifier vos spams.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm"
              >
                <ArrowLeft className="size-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-white/70 text-sm">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre
                  mot de passe.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-400/30">
                  <div className="flex items-start gap-3">
                    {error.includes("attendre") ? (
                      <div className="flex-shrink-0 mt-0.5">
                        <svg
                          className="size-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 mt-0.5">
                        <svg
                          className="size-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-red-300 text-sm">{error}</p>
                      {error.includes("attendre") && (
                        <p className="text-red-400/80 text-xs mt-2">
                          💡 Cette limite protège contre les abus. Réessayez dans quelques minutes.
                        </p>
                      )}
                      {error.includes("expiré") && (
                        <p className="text-red-400/80 text-xs mt-2">
                          💡 Les liens de réinitialisation expirent rapidement pour votre sécurité.
                          Utilisez le lien immédiatement après l&apos;avoir reçu.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form action={resetPasswordRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="votre@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="size-4 mr-2" />
                  Envoyer le lien de réinitialisation
                </Button>
              </form>

              <div className="mt-6 text-center text-white/80 text-sm">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link href="/login" className="font-semibold hover:text-white transition-colors">
                  Se connecter
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
