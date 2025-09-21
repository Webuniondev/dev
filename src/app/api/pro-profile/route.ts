import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";
import {
  type ProProfileCreateInput,
  proProfileCreateSchema,
  type ProProfileUpdateInput,
  proProfileUpdateSchema,
} from "@/lib/validation/user";

// GET /api/pro-profile - Récupérer le profil PRO de l'utilisateur connecté
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est PRO
    const { data: userProfile } = await supabase
      .from("user_profile")
      .select("role_key")
      .eq("user_id", user.id)
      .single();

    if (userProfile?.role_key !== "pro") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Récupérer le profil PRO avec les données liées
    const { data: proProfile, error } = await supabase
      .from("pro_profile")
      .select(
        `
        *,
        pro_category:category_key (key, label, description),
        pro_sector:sector_key (key, label, description)
      `,
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération du profil PRO:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ data: proProfile });
  } catch (error) {
    console.error("Erreur dans GET /api/pro-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/pro-profile - Créer un profil PRO
export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est PRO
    const { data: userProfile } = await supabase
      .from("user_profile")
      .select("role_key")
      .eq("user_id", user.id)
      .single();

    if (userProfile?.role_key !== "pro") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Vérifier qu'il n'a pas déjà un profil PRO
    const { data: existingProfile } = await supabase
      .from("pro_profile")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: "Profil professionnel déjà existant" }, { status: 409 });
    }

    // Valider les données
    const body = await req.json();
    const validationResult = proProfileCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const profileData: ProProfileCreateInput = validationResult.data;

    // Vérifier que la catégorie appartient au secteur
    const { data: category } = await supabase
      .from("pro_category")
      .select("sector_key")
      .eq("key", profileData.category_key)
      .single();

    if (!category || category.sector_key !== profileData.sector_key) {
      return NextResponse.json(
        { error: "La catégorie ne correspond pas au secteur sélectionné" },
        { status: 400 },
      );
    }

    // Créer le profil PRO
    const { data: newProfile, error } = await supabase
      .from("pro_profile")
      .insert({
        user_id: user.id,
        ...profileData,
      })
      .select(
        `
        *,
        pro_category:category_key (key, label, description),
        pro_sector:sector_key (key, label, description)
      `,
      )
      .single();

    if (error) {
      console.error("Erreur lors de la création du profil PRO:", error);
      return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }

    return NextResponse.json({ data: newProfile }, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST /api/pro-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/pro-profile - Mettre à jour le profil PRO
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Valider les données
    const body = await req.json();
    const validationResult = proProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const updateData: ProProfileUpdateInput = validationResult.data;

    // Si catégorie/secteur modifiés, vérifier la cohérence
    if (updateData.category_key && updateData.sector_key) {
      const { data: category } = await supabase
        .from("pro_category")
        .select("sector_key")
        .eq("key", updateData.category_key)
        .single();

      if (!category || category.sector_key !== updateData.sector_key) {
        return NextResponse.json(
          { error: "La catégorie ne correspond pas au secteur sélectionné" },
          { status: 400 },
        );
      }
    }

    // Mettre à jour le profil (RLS s'assure que c'est le bon utilisateur)
    const { data: updatedProfile, error } = await supabase
      .from("pro_profile")
      .update(updateData)
      .eq("user_id", user.id)
      .select(
        `
        *,
        pro_category:category_key (key, label, description),
        pro_sector:sector_key (key, label, description)
      `,
      )
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour du profil PRO:", error);
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ data: updatedProfile });
  } catch (error) {
    console.error("Erreur dans PATCH /api/pro-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/pro-profile - Supprimer le profil PRO
export async function DELETE() {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Supprimer le profil (RLS s'assure que c'est le bon utilisateur)
    const { error } = await supabase.from("pro_profile").delete().eq("user_id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression du profil PRO:", error);
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profil professionnel supprimé" });
  } catch (error) {
    console.error("Erreur dans DELETE /api/pro-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
