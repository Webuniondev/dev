import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";
import { profileUpsertSchema } from "@/lib/validation/user";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = profileUpsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await supabaseServer();

    // Récupérer l'utilisateur authentifié
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const values = parsed.data;

    // Upsert sous RLS (limité au user_id courant)
    const { error } = await supabase
      .from("user_profile")
      .upsert({ user_id: user.id, ...values }, { onConflict: "user_id" })
      .select("user_id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}


