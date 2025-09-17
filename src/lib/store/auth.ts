"use client";

import { create } from "zustand";

export type AuthUserSnapshot = {
  userId: string | null;
  email: string | null;
  roleKey: "user" | "pro" | "admin" | null;
  displayName?: string | null;
};

type AuthState = AuthUserSnapshot & {
  setAuth: (snapshot: AuthUserSnapshot) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  roleKey: null,
  setAuth: (snapshot) =>
    set(() => ({
      userId: snapshot.userId,
      email: snapshot.email ?? null,
      roleKey: snapshot.roleKey ?? null,
      displayName: snapshot.displayName ?? null,
    })),
  clearAuth: () => set(() => ({ userId: null, email: null, roleKey: null, displayName: null })),
}));


