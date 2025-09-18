import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MonEspaceLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let roleKey: "user" | "pro" | "admin" | null = null;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("user_profile")
      .select("role_key, first_name, last_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    roleKey = (prof?.role_key as "user" | "pro" | "admin" | null) ?? null;
    displayName = `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim() || user.user_metadata?.full_name || null;
    avatarUrl = prof?.avatar_url ?? (user.user_metadata?.avatar_url ?? null);
  }

  return (
    <AppShell displayName={displayName} email={user?.email ?? null} roleKey={roleKey} avatarUrl={avatarUrl}>
      {children}
    </AppShell>
  );
}


