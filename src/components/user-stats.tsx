"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface UserStats {
  total: number;
  active: number;
  pro: number;
  admin: number;
}

interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
  lastUpdated: string;
}

export function UserStats() {
  const [data, setData] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { secureGet } = useSecureFetch();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await secureGet("/api/admin/user-stats");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors du chargement des statistiques");
        }

        const result: UserStatsResponse = await response.json();
        setData(result);
      } catch (err) {
        console.error("Erreur fetch stats:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [secureGet]);

  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await secureGet("/api/admin/user-stats");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du chargement des statistiques");
      }

      const result: UserStatsResponse = await response.json();
      setData(result);
    } catch (err) {
      console.error("Erreur fetch stats:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
        <CardHeader>
          <CardTitle className="text-gray-100">Statistiques</CardTitle>
          <CardDescription className="text-gray-400">
            Vue d&apos;ensemble des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg text-center animate-pulse"
                style={{ backgroundColor: "#0f0f0f" }}
              >
                <div className="h-8 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
        <CardHeader>
          <CardTitle className="text-gray-100">Statistiques</CardTitle>
          <CardDescription className="text-gray-400">
            Vue d&apos;ensemble des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={refreshStats}
              className="px-4 py-2 text-white rounded-md"
              style={{ backgroundColor: "#0f0f0f" }}
            >
              🔄 Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, lastUpdated } = data;

  return (
    <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
      <CardHeader>
        <CardTitle className="text-gray-100">Statistiques</CardTitle>
        <CardDescription className="text-gray-400">
          Vue d&apos;ensemble des utilisateurs - Dernière mise à jour:{" "}
          {new Date(lastUpdated).toLocaleString("fr-FR")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "#0f0f0f" }}>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-300">Total utilisateurs</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "#0f0f0f" }}>
            <div className="text-3xl font-bold text-white">{stats.active}</div>
            <div className="text-sm text-gray-300">Utilisateurs actifs</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "#0f0f0f" }}>
            <div className="text-3xl font-bold text-white">{stats.pro}</div>
            <div className="text-sm text-gray-300">Utilisateurs PRO</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "#0f0f0f" }}>
            <div className="text-3xl font-bold text-white">{stats.admin}</div>
            <div className="text-sm text-gray-300">Administrateurs</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-600">
          <button
            onClick={refreshStats}
            className="w-full px-4 py-2 text-white rounded-md text-sm"
            style={{ backgroundColor: "#0f0f0f" }}
          >
            🔄 Actualiser les statistiques
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
