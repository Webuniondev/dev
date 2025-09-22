import { LogOutIcon, SettingsIcon, ShieldIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseServer } from "@/lib/supabase/server";

export async function SiteHeader() {
  // Déterminer l'utilisateur côté serveur pour adapter l'UI publique
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let displayName: string | null = null;
  let avatarFallback: string = "U";
  let roleKey: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("user_profile")
      .select("first_name, last_name, role_key, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    const fromProfile = `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim();
    const fromMeta = (user.user_metadata?.full_name as string | undefined) ?? undefined;
    const fromEmail = user.email ?? undefined;
    displayName = (fromProfile || fromMeta || fromEmail) ?? null;
    roleKey = prof?.role_key ?? null;
    avatarUrl = prof?.avatar_url ?? (user.user_metadata?.avatar_url as string | null) ?? null;

    // Générer les initiales pour l'avatar fallback
    if (prof?.first_name && prof?.last_name) {
      avatarFallback = `${prof.first_name.charAt(0)}${prof.last_name.charAt(0)}`.toUpperCase();
    } else if (fromMeta) {
      const names = fromMeta.split(" ");
      avatarFallback =
        names.length > 1
          ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
          : names[0].charAt(0).toUpperCase();
    } else if (user.email) {
      avatarFallback = user.email.charAt(0).toUpperCase();
    }
  }

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-black text-white">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg sm:text-2xl font-archivo-black hover:text-white/90 transition-colors"
        >
          OURSPACE
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-2 bg-white text-black hover:bg-white/90">
              <UserIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0">
              {/* Header avec infos utilisateur */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 border-b">
                <Avatar className="size-10">
                  <AvatarImage src={avatarUrl ?? undefined} alt={displayName || "User"} />
                  <AvatarFallback className="text-sm font-medium">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {displayName || "Utilisateur"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <DropdownMenuItem asChild>
                  <Link
                    href="/mon-espace"
                    className="flex items-center gap-3 px-3 py-2 text-sm h-10"
                  >
                    <UserIcon className="size-4" />
                    Mon espace
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/parametre-compte"
                    className="flex items-center gap-3 px-3 py-2 text-sm h-10"
                  >
                    <SettingsIcon className="size-4" />
                    Paramètre du compte
                  </Link>
                </DropdownMenuItem>

                {/* Lien Administration - visible uniquement pour les admins */}
                {roleKey === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/administration"
                      className="flex items-center gap-3 px-3 py-2 text-sm h-10"
                    >
                      <ShieldIcon className="size-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left h-10"
                    >
                      <LogOutIcon className="size-4" />
                      Déconnexion
                    </button>
                  </form>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-white text-black px-4 py-2 text-base font-semibold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
