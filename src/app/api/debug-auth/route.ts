import { supabaseServer } from "@/lib/supabase/server";

// Route de debug pour tester la configuration Supabase
export async function GET() {
  try {
    const supabase = await supabaseServer({ readOnly: true });

    // Obtenir les informations de configuration
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    // Tester la connexion basique
    const { data: healthCheck, error: healthError } = await supabase
      .from("user_role")
      .select("key")
      .limit(1);

    return Response.json({
      success: true,
      config,
      healthCheck: {
        connected: !healthError,
        error: healthError?.message,
        dataReceived: !!healthCheck?.length,
      },
    });
  } catch (error) {
    console.error("Debug auth error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
