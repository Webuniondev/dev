import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

// GET /api/pro-data - Récupérer les secteurs et catégories pour les formulaires
export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer({ readOnly: true });
    const { searchParams } = new URL(req.url);
    const sectorKey = searchParams.get("sector");

    // Si un secteur spécifique est demandé, récupérer ses catégories
    if (sectorKey) {
      const { data: categories, error } = await supabase
        .from("pro_category")
        .select("key, label, description")
        .eq("sector_key", sectorKey)
        .order("label");

      if (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      return NextResponse.json({ categories });
    }

    // Récupérer tous les secteurs avec leurs catégories
    const [{ data: sectors, error: sectorsError }, { data: categories, error: categoriesError }] =
      await Promise.all([
        supabase.from("pro_sector").select("key, label, description").order("label"),
        supabase
          .from("pro_category")
          .select("key, label, description, sector_key")
          .order("sector_key, label"),
      ]);

    if (sectorsError || categoriesError) {
      console.error("Erreur lors de la récupération des données PRO:", {
        sectorsError,
        categoriesError,
      });
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Grouper les catégories par secteur
    const sectorsWithCategories =
      sectors?.map((sector) => ({
        ...sector,
        categories: categories?.filter((cat) => cat.sector_key === sector.key) || [],
      })) || [];

    return NextResponse.json({
      sectors: sectorsWithCategories,
      allCategories: categories,
    });
  } catch (error) {
    console.error("Erreur dans GET /api/pro-data:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
