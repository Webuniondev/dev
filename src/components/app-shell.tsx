"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { SidebarApp } from "@/components/sidebar-app";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type Props = {
  displayName: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  children: React.ReactNode;
};

export function AppShell({ displayName, email, roleKey, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname || pathname === "/") return "Accueil";
    const segs = pathname.split("/").filter(Boolean);
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
    return segs.map(cap).join(" / ");
  }, [pathname]);

  return (
    <div className={`min-h-dvh grid grid-cols-1 ${collapsed ? "sm:grid-cols-1" : "sm:grid-cols-[16rem_1fr]"}`}>
      {!collapsed && (
        <SidebarApp displayName={displayName} email={email} roleKey={roleKey} />
      )}
      <div className={`flex min-h-dvh flex-col ${!collapsed ? "border-l border-slate-800" : ""}`}>
        <header className="h-14 bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center px-4 sm:px-6">
          <button
            type="button"
            aria-label="Basculer la barre latérale"
            onClick={() => {
              if (typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches) {
                setCollapsed((v) => !v);
              } else {
                setMobileOpen(true);
              }
            }}
            className="rounded-md border border-slate-700 px-2 py-1 text-sm hover:bg-slate-800"
          >
            ☰
          </button>
          <div className="ml-3 font-medium">{title}</div>
          <div className="flex-1" />
        </header>
        <div className="flex-1">{children}</div>
      </div>
      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 text-slate-100">
          <SidebarApp displayName={displayName} email={email} roleKey={roleKey} mobile />
        </SheetContent>
      </Sheet>
    </div>
  );
}


