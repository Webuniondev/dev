import { NextResponse } from "next/server";

import { withApiProtection } from "@/lib/api-security";
import { supabaseServer } from "@/lib/supabase/server";

// GET /api/pro-data - Récupérer les secteurs et catégories pour l'inscription PRO
async function getProData() {
  try {
    const supabase = await supabaseServer({ readOnly: true });

    // Récupérer les secteurs et leurs catégories
    const { data: sectors, error: sectorsError } = await supabase
      .from("pro_sector")
      .select(
        `
        key,
        label,
        description,
        pro_category:pro_category (
          key,
          label,
          description
        )
      `,
      )
      .order("label");

    if (sectorsError) {
      console.error("Erreur lors de la récupération des secteurs:", sectorsError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Réorganiser les données pour faciliter l'usage côté client
    const formattedData =
      sectors?.map((sector) => ({
        key: sector.key,
        label: sector.label,
        description: sector.description,
        categories: sector.pro_category || [],
      })) || [];

    return NextResponse.json({
      sectors: formattedData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur dans GET /api/pro-data:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Protection de la route (accessible aux non-authentifiés pour l'inscription)
export const GET = withApiProtection(getProData);
