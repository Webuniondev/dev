import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminSectorsPage() {
  const supabase = await supabaseServer({ readOnly: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profile")
    .select("role_key")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role_key !== "admin") return null;

  const { data: sectors } = await supabase
    .from("pro_sector")
    .select(`key,label,description,pro_category:pro_category(key,label)`)
    .order("label");

  type SectorRow = {
    key: string;
    label: string;
    description: string | null;
    pro_category: { key: string; label: string }[];
  };

  const items = ((sectors as SectorRow[]) || []).map((s) => ({
    key: s.key,
    label: s.label,
    categoriesCount: Array.isArray(s.pro_category) ? s.pro_category.length : 0,
  }));

  const totalSectors = items.length;
  const totalCategories = items.reduce((acc, s) => acc + s.categoriesCount, 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Secteurs & catégories</h1>
            <p className="text-gray-400 mt-2">
              Résumé des secteurs d&apos;activité et de leurs catégories
            </p>
          </div>
          <Link href="/administration" className="text-gray-400 hover:text-white transition-colors">
            ← Retour à l&apos;administration
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Résumé global sur toute la largeur */}
          <Card className="sm:col-span-2 lg:col-span-3" style={{ backgroundColor: "#181818" }}>
            <CardHeader>
              <CardTitle className="text-gray-100">Résumé</CardTitle>
              <CardDescription className="text-gray-400">Vue d&apos;ensemble</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                  <div className="text-3xl font-bold text-white">{totalSectors}</div>
                  <div className="text-gray-300">secteurs</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
                  <div className="text-3xl font-bold text-white">{totalCategories}</div>
                  <div className="text-gray-300">catégories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cartes par secteur */}
          {items.map((s) => (
            <Card key={s.key} style={{ backgroundColor: "#181818" }}>
              <CardHeader>
                <CardTitle className="text-gray-100">{s.label}</CardTitle>
                <CardDescription className="text-gray-400">Secteur: {s.key}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`/administration/secteurs/${s.key}`}
                    className="p-3 rounded-lg block"
                    style={{ backgroundColor: "#0f0f0f" }}
                  >
                    <div className="text-2xl font-bold text-white">{s.categoriesCount}</div>
                    <div className="text-gray-300">catégories</div>
                    <div className="text-sm text-gray-500 mt-2 sticky bottom-0">
                      Voir les catégories →
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
