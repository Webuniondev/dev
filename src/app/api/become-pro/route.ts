import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";
import { type ProProfileCreateInput, proProfileCreateSchema } from "@/lib/validation/user";

// POST /api/become-pro - Transformer un utilisateur en professionnel
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

    // Vérifier que l'utilisateur n'est pas déjà PRO
    const { data: userProfile } = await supabase
      .from("user_profile")
      .select("role_key")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "Profil utilisateur introuvable" }, { status: 404 });
    }

    if (userProfile.role_key === "pro") {
      return NextResponse.json({ error: "L'utilisateur est déjà professionnel" }, { status: 409 });
    }

    // Valider les données du profil professionnel
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

    // Utiliser la fonction RPC pour la transformation atomique
    const { error: rpcError } = await supabase.rpc("become_professional", {
      target_user_id: user.id,
      category_key: profileData.category_key,
      sector_key: profileData.sector_key,
      business_name: profileData.business_name || null,
      description: profileData.description || null,
      experience_years: profileData.experience_years || null,
    });

    if (rpcError) {
      console.error("Erreur RPC become_professional:", rpcError);
      return NextResponse.json(
        { error: "Erreur lors de la transformation en professionnel: " + rpcError.message },
        { status: 500 },
      );
    }

    // Récupérer le profil complet nouvellement créé
    const { data: newProProfile, error: fetchError } = await supabase
      .from("pro_profile")
      .select(
        `
        *,
        pro_category:category_key (key, label, description),
        pro_sector:sector_key (key, label, description)
      `,
      )
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Erreur lors de la récupération du profil PRO:", fetchError);
      // La transformation a réussi mais on ne peut pas récupérer le profil
      return NextResponse.json({ message: "Transformation réussie", data: null }, { status: 201 });
    }

    return NextResponse.json(
      {
        message: "Transformation en professionnel réussie",
        data: newProProfile,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur dans POST /api/become-pro:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
