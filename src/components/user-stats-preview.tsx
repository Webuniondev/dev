"use client";

import { useEffect, useState } from "react";

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

export function UserStatsPreview() {
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
        console.error("Erreur fetch stats preview:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [secureGet]);

  if (loading) return null;

  if (error) {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="text-3xl font-bold text-gray-500">-</div>
          <div className="text-gray-400">Total utilisateurs</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="text-3xl font-bold text-gray-500">-</div>
          <div className="text-gray-400">Actifs (30j)</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="text-3xl font-bold text-gray-500">-</div>
          <div className="text-gray-400">Total utilisateurs</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
          <div className="text-3xl font-bold text-gray-500">-</div>
          <div className="text-gray-400">Actifs (30j)</div>
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
        <div className="text-3xl font-bold text-white">{stats.total}</div>
        <div className="text-gray-300">Total utilisateurs</div>
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: "#0f0f0f" }}>
        <div className="text-3xl font-bold text-white">{stats.active}</div>
        <div className="text-gray-300">Actifs (30j)</div>
      </div>
    </div>
  );
}
