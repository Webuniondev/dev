import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";
import { profilePartialUpdateSchema, profileUpsertSchema } from "@/lib/validation/user";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = profileUpsertSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const json = await req.json();
    const parsed = profilePartialUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const values = parsed.data;

    // Récupérer l'avatar actuel avant mise à jour
    const { data: currentProfile } = await supabase
      .from("user_profile")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    const { error, data } = await supabase
      .from("user_profile")
      .update({ ...values })
      .eq("user_id", user.id)
      .select("user_id");

    if (error) {
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 },
      );
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Profile not found for current user" }, { status: 404 });
    }

    // Supprimer l'ancien fichier si avatar_url a changé et que l'ancien appartient bien à ce user
    try {
      const oldUrl = currentProfile?.avatar_url as string | undefined;
      const newUrl = values.avatar_url as string | undefined;
      if (oldUrl && newUrl && oldUrl !== newUrl) {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const prefix = `${base}/storage/v1/object/public/avatars/`;
        if (oldUrl.startsWith(prefix)) {
          const oldPath = oldUrl.slice(prefix.length);
          if (oldPath.startsWith(`${user.id}/`)) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }
      }
    } catch {
      // Ignorer les erreurs de suppression pour ne pas bloquer la MAJ du profil
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
