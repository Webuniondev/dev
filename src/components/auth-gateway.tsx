"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth";

type Props = {
  userId: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  displayName?: string | null;
};

// Hydrate client store from server user snapshot
export function AuthGateway({ userId, email, roleKey, displayName }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);
  useEffect(() => {
    setAuth({ userId, email, roleKey, displayName: displayName ?? null });
  }, [userId, email, roleKey, displayName, setAuth]);
  return null;
}


