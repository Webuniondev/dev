import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SidebarAppProps = {
  displayName: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  avatarUrl?: string | null;
  mobile?: boolean;
};

export function SidebarApp({
  displayName,
  email,
  roleKey,
  avatarUrl,
  mobile = false,
}: SidebarAppProps) {
  return (
    <aside
      className={`${mobile ? "flex" : "hidden sm:flex"} w-64 flex-col h-full bg-slate-900 text-slate-100`}
    >
      <div className="h-14 flex items-center justify-start border-b border-slate-800 px-4 flex-shrink-0">
        <Link href="/" className="relative inline-flex items-center">
          <span className="inline-block font-caveat text-3xl leading-none">
            Ourspace
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div className="text-xs/6 px-2 text-slate-400">Applications</div>
        <Link
          href="/mon-espace"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <span>Mon espace</span>
        </Link>

        {/* Lien Administration - visible uniquement pour les admins */}
        {roleKey === "admin" && (
          <>
            <div className="text-xs/6 px-2 text-slate-400 mt-4">Administration</div>
            <Link
              href="/administration"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <span>Panneau admin</span>
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-slate-800 p-3 text-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? email ?? "Utilisateur"} />
            <AvatarFallback>{(displayName?.[0] ?? email?.[0] ?? "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{displayName ?? email ?? "Utilisateur"}</div>
            {roleKey ? (
              <div className="text-slate-400 text-xs mt-0.5 truncate">{roleKey}</div>
            ) : null}
          </div>
        </div>
        <form action={signOutAction} className="mt-3">
          <Button
            type="submit"
            variant="outline"
            className="w-full bg-slate-800/50 text-slate-100 hover:bg-slate-800"
          >
            Se déconnecter
          </Button>
        </form>
      </div>
    </aside>
  );
}
