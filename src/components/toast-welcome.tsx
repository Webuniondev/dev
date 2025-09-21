"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/lib/store/auth";

export function ToastWelcome() {
  const displayName = useAuthStore((s) => s.displayName);
  const email = useAuthStore((s) => s.email);
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    // Lire un cookie éphémère 'welcome=1' posé par la Server Action de login
    const shouldWelcome = document.cookie.split(/;\s*/).some((c) => c.startsWith("welcome=1"));
    if (!shouldWelcome) return;

    // Attendre que le store soit hydraté si besoin
    const tryShow = () => {
      const name = displayName || email;
      if (!name) return false;
      shown.current = true;
      toast.success(`Bonjour, ${name} !\nRavi de vous revoir !`);
      // Supprimer le cookie pour éviter la réapparition
      try {
        document.cookie = "welcome=; Max-Age=0; path=/";
      } catch {}
      return true;
    };

    if (tryShow()) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - start > 1500) {
        window.clearInterval(id);
        return;
      }
      if (tryShow()) {
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [displayName, email, router]);

  return null;
}
