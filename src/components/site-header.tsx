import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabaseServer } from "@/lib/supabase/server";

export async function SiteHeader() {
  // Déterminer l'utilisateur côté serveur pour adapter l'UI publique
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let displayName: string | null = null;
  let avatarFallback: string = "U";
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
    
    // Générer les initiales pour l'avatar fallback
    if (prof?.first_name && prof?.last_name) {
      avatarFallback = `${prof.first_name.charAt(0)}${prof.last_name.charAt(0)}`.toUpperCase();
    } else if (fromMeta) {
      const names = fromMeta.split(' ');
      avatarFallback = names.length > 1 
        ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
        : names[0].charAt(0).toUpperCase();
    } else if (user.email) {
      avatarFallback = user.email.charAt(0).toUpperCase();
    }
  }

  return (
    <header className="h-14 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <div className="font-semibold">OURSPACE</div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
              <Avatar className="size-6">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName || "User"} />
                <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
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


