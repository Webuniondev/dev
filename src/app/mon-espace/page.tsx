import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

export default async function MonEspacePage() {
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }
  return (
    <main className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Mon espace</h1>
      <p className="text-muted-foreground">Contenu à venir…</p>
    </main>
  );
}


