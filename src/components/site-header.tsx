import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabaseServer } from "@/lib/supabase/server";

export async function SiteHeader() {
  // Déterminer l'utilisateur côté serveur pour adapter l'UI publique
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let displayName: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("user_profile")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const fromProfile = `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim();
    const fromMeta = (user.user_metadata?.full_name as string | undefined) ?? undefined;
    const fromEmail = user.email ?? undefined;
    displayName = (fromProfile || fromMeta || fromEmail) ?? null;
  }

  return (
    <header className="h-14 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <div className="font-semibold">OURSPACE</div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
              {displayName}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/mon-espace">Mon espace</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action={signOutAction} className="w-full">
                  <button type="submit" className="w-full text-left">Se déconnecter</button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}


