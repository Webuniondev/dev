import "server-only";

import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type SupabaseServerOptions = { readOnly?: boolean };

export const supabaseServer = async (options: SupabaseServerOptions = {}) => {
  const { readOnly = false } = options;
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (readOnly) return; // En RSC, ne pas modifier les cookies
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (readOnly) return;
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
};
