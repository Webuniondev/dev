"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth";

type Props = {
  userId: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

// Hydrate client store from server user snapshot
export function AuthGateway({ userId, email, roleKey, displayName, avatarUrl }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);
  useEffect(() => {
    setAuth({ userId, email, roleKey, displayName: displayName ?? null, avatarUrl: avatarUrl ?? null });
  }, [userId, email, roleKey, displayName, avatarUrl, setAuth]);
  return null;
}


