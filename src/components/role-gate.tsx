"use client";

import { ReactNode, useMemo } from "react";

import { useAuthStore } from "@/lib/store/auth";

type Role = "user" | "pro" | "admin";

type Props = {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGate({ allow, children, fallback = null }: Props) {
  const roleKey = useAuthStore((s) => s.roleKey);
  const isAllowed = useMemo(() => {
    if (!roleKey) return false;
    return allow.includes(roleKey);
  }, [allow, roleKey]);

  return <>{isAllowed ? children : fallback}</>;
}


