"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

type Department = {
  code: string;
  name: string;
  region: string;
};

type DepartmentsData = {
  departments: Department[];
  departmentsByRegion: Record<string, Array<{ code: string; name: string }>>;
};

export function DepartmentsList() {
  const { secureGet } = useSecureFetch();
  const [data, setData] = useState<DepartmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await secureGet("/api/departments");
      const result = await response.json();

      setData(result);
    } catch (err) {
      console.error("Erreur lors de la récupération des départements:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [secureGet]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  if (loading) {
    return (
      <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
        <CardHeader>
          <CardTitle className="text-gray-100">Départements français</CardTitle>
          <CardDescription className="text-gray-400">Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-gray-300">Chargement des départements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Départements français</CardTitle>
          <CardDescription>Test de récupération des données API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 font-medium mb-4">❌ Erreur</div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchDepartments}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Départements français</CardTitle>
          <CardDescription>Test de récupération des données API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Départements français</CardTitle>
          <CardDescription>
            Données de référence - {data.departments.length} départements chargés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.departments.length}</div>
              <div className="text-sm text-blue-800">Départements total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(data.departmentsByRegion).length}
              </div>
              <div className="text-sm text-green-800">Régions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.departments.filter((d) => d.code.length === 3).length}
              </div>
              <div className="text-sm text-purple-800">Outre-mer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste par région */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(data.departmentsByRegion)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([region, departments]) => (
            <Card key={region}>
              <CardHeader>
                <CardTitle className="text-lg">{region}</CardTitle>
                <CardDescription>{departments.length} départements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {departments
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((dept) => (
                      <div
                        key={dept.code}
                        className="flex items-center justify-between p-2 rounded border hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium">{dept.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{dept.code}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Actions administrateur */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Actions administrateur</CardTitle>
          <CardDescription>Gestion et maintenance des données départements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                🔄 Recharger les données
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled
              >
                ➕ Ajouter département (à implémenter)
              </button>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-4">
              <strong>Statut API :</strong> Les départements sont chargés depuis l&apos;API protégée
              /api/departments.
              <br />
              <strong>Base de données :</strong> Table public.french_departments avec{" "}
              {data.departments.length} entrées.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
