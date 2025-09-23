"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { SidebarApp } from "@/components/sidebar-app";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/store/auth";

type Props = {
  displayName: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
};

export function AppShell({ displayName, email, roleKey, avatarUrl, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const storeAvatarUrl = useAuthStore((s) => s.avatarUrl ?? null);

  const SIDEBAR_WIDTH_PX = 256; // w-64

  const title = useMemo(() => {
    if (!pathname || pathname === "/") return "Accueil";
    const segs = pathname.split("/").filter(Boolean);
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
    return segs.map(cap).join(" / ");
  }, [pathname]);

  return (
    <div className="h-dvh flex overflow-hidden">
      {/* Desktop sidebar with smooth width animation */}
      <motion.aside
        initial={{ width: collapsed ? 0 : SIDEBAR_WIDTH_PX }}
        animate={{ width: collapsed ? 0 : SIDEBAR_WIDTH_PX }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden h-full overflow-hidden bg-slate-900 text-slate-100 sm:flex"
        aria-hidden={collapsed}
      >
        {/* Keep SidebarApp intact; wrap to preserve intrinsic width w-64 */}
        <div className="w-64 h-full">
          <SidebarApp
            displayName={displayName}
            email={email}
            roleKey={roleKey}
            avatarUrl={storeAvatarUrl ?? avatarUrl ?? null}
          />
        </div>
      </motion.aside>
      <div className="flex h-full flex-1 flex-col overflow-hidden border-l border-slate-800">
        <header className="h-14 bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center px-4 sm:px-6 flex-shrink-0">
          <button
            type="button"
            aria-label="Basculer la barre latérale"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.matchMedia("(min-width: 640px)").matches
              ) {
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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          aria-label="Navigation latérale"
          className="p-0 w-64 bg-slate-900 text-slate-100"
        >
          <SheetHeader className="p-0">
            <VisuallyHidden asChild>
              <SheetTitle>Navigation latérale</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          <SidebarApp
            displayName={displayName}
            email={email}
            roleKey={roleKey}
            avatarUrl={storeAvatarUrl ?? avatarUrl ?? null}
            mobile
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
