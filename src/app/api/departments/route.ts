import { NextResponse } from "next/server";

import { withApiProtection } from "@/lib/api-security";
import { supabaseServer } from "@/lib/supabase/server";

// GET /api/departments - Récupérer la liste des départements français
async function getDepartments() {
  try {
    const supabase = await supabaseServer({ readOnly: true });

    // Récupérer tous les départements triés par nom
    const { data: departments, error } = await supabase
      .from("french_departments")
      .select("code, name, region")
      .order("name");

    if (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Grouper par région pour faciliter l'affichage
    const departmentsByRegion =
      departments?.reduce(
        (acc, dept) => {
          const region = dept.region || "Autres";
          if (!acc[region]) {
            acc[region] = [];
          }
          acc[region].push({
            code: dept.code,
            name: dept.name,
          });
          return acc;
        },
        {} as Record<string, Array<{ code: string; name: string }>>,
      ) || {};

    return NextResponse.json({
      departments: departments || [],
      departmentsByRegion,
    });
  } catch (error) {
    console.error("Erreur dans GET /api/departments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Protection de la route
export const GET = withApiProtection(getDepartments);
