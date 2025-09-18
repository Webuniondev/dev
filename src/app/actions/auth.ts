"use server";

import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
