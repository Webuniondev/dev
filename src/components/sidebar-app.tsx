import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type SidebarAppProps = {
  displayName: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  mobile?: boolean;
};

export function SidebarApp({ displayName, email, roleKey, mobile = false }: SidebarAppProps) {
  return (
    <aside className={`${mobile ? "flex" : "hidden sm:flex"} w-64 flex-col min-h-dvh bg-slate-900 text-slate-100`}>
      <div className="h-14 flex items-center border-b border-slate-800 px-4 text-sm uppercase tracking-wide">
        <Link href="/" className="font-semibold hover:underline">OURSPACE</Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        <div className="text-xs/6 px-2 text-slate-400">Applications</div>
        <Link
          href="/mon-espace"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <span>Mon espace</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-slate-800 p-3 text-sm">
        <div className="font-medium truncate">{displayName ?? email ?? "Utilisateur"}</div>
        {roleKey ? <div className="text-slate-400 text-xs mt-0.5">{roleKey}</div> : null}
        <form action={signOutAction} className="mt-3">
          <Button type="submit" variant="outline" className="w-full bg-slate-800/50 text-slate-100 hover:bg-slate-800">
            Se déconnecter
          </Button>
        </form>
      </div>
    </aside>
  );
}


