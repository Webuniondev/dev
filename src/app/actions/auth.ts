"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInOAuthAction(formData: FormData) {
  const provider = String(formData.get("provider") || "");
  const supabase = await supabaseServer();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${origin}/mon-espace`;

  // Sécuriser: n'autoriser que les providers connus
  if (provider !== "github" && provider !== "google") {
    redirect(`/login?error=${encodeURIComponent("Provider inconnu")}`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "github" | "google",
    options: { redirectTo },
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent("Échec de la connexion OAuth")}`);
  }
  if (data?.url) {
    redirect(data.url);
  }
  redirect("/login");
}
