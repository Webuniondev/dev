import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ key: string }>;
}

interface SectorCategoryRow {
  key: string;
  label: string;
  description: string | null;
}

interface SectorWithCategoriesRow {
  key: string;
  label: string;
  description: string | null;
  pro_category: SectorCategoryRow[];
}

export default async function SectorDetailPage({ params }: Props) {
  const supabase = await supabaseServer({ readOnly: true });
  const { key } = await params;

  const { data: sectorData } = await supabase
    .from("pro_sector")
    .select(`key,label,description,pro_category:pro_category(key,label,description)`)
    .eq("key", key)
    .maybeSingle();

  const sector = (sectorData as SectorWithCategoriesRow | null) ?? null;

  if (!sector) notFound();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{sector.label}</h1>
            <p className="text-gray-400 mt-2">Catégories du secteur</p>
          </div>
          <Link
            href="/administration/secteurs"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Tous les secteurs
          </Link>
        </div>

        <Card style={{ backgroundColor: "#181818" }}>
          <CardHeader>
            <CardTitle className="text-gray-100">Catégories</CardTitle>
            <CardDescription className="text-gray-400">
              {(sector.pro_category || []).length} catégories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300">Clé</th>
                    <th className="px-4 py-3 text-left text-gray-300">Libellé</th>
                    <th className="px-4 py-3 text-left text-gray-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(sector.pro_category || []).map((c: SectorCategoryRow) => (
                    <tr key={c.key} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-gray-100">{c.key}</td>
                      <td className="px-4 py-3 text-gray-100">{c.label}</td>
                      <td className="px-4 py-3 text-gray-400">{c.description ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
