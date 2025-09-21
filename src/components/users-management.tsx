"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface User {
  user_id: string;
  last_name: string;
  first_name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone_number?: string;
  role_key: "user" | "pro" | "admin";
  department_code?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  auth_users: {
    email: string;
    email_confirmed_at?: string;
    last_sign_in_at?: string;
    created_at: string;
  };
  french_departments?: {
    name: string;
    region: string;
  };
}

interface UsersData {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search?: string;
    role?: string;
    sortBy: string;
    sortOrder: string;
  };
}

interface UsersResponse {
  success: boolean;
  data: UsersData;
  lastUpdated: string;
}

export function UsersManagement() {
  const { secureGet, securePost } = useSecureFetch();
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // Filtres et pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy] = useState("created_at"); // Fixé pour la version minimaliste
  const [sortOrder] = useState("desc"); // Fixé pour la version minimaliste

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);

      const response = await secureGet(`/api/admin/users?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du chargement des utilisateurs");
      }

      const result: UsersResponse = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Erreur fetch users:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [secureGet, currentPage, searchTerm, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Recherche automatique avec debounce
  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        fetchUsers();
      }, 500); // Délai de 500ms pour éviter trop de requêtes

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, fetchUsers]);

  // Auto-refresh quand le filtre de rôle change
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);

      const response = await securePost("/api/admin/user-role", {
        userId,
        role_key: newRole,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      // Recharger les données
      await fetchUsers();
    } catch (err) {
      console.error("Erreur update role:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setUpdatingUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !data) {
    return (
      <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
        <CardHeader>
          <CardTitle className="text-gray-100">Liste des utilisateurs</CardTitle>
          <CardDescription className="text-gray-400">Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-gray-300">Chargement des utilisateurs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-lg" style={{ backgroundColor: "#181818" }}>
        <CardHeader>
          <CardTitle className="text-gray-100">Liste des utilisateurs</CardTitle>
          <CardDescription className="text-gray-400">Erreur de chargement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
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

  return (
    <div className="space-y-4">
      {/* Barre de recherche minimaliste */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value === "") {
              fetchUsers();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              fetchUsers();
            }
          }}
          className="flex-1 px-4 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
          style={{ backgroundColor: "#181818" }}
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded text-white border border-gray-600"
          style={{ backgroundColor: "#181818" }}
        >
          <option value="">Tous</option>
          <option value="user">User</option>
          <option value="pro">Pro</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Liste minimaliste */}
      <Card className="rounded-lg border border-gray-600" style={{ backgroundColor: "#181818" }}>
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">Erreur de chargement</p>
              <button onClick={fetchUsers} className="text-gray-400 hover:text-white text-sm">
                Réessayer
              </button>
            </div>
          ) : !data || data.users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aucun utilisateur trouvé</div>
          ) : (
            <>
              {/* En-tête de tableau */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-600 text-sm text-gray-400 font-medium">
                <div>Utilisateur</div>
                <div>Email</div>
                <div>Rôle</div>
                <div>Dernière connexion</div>
              </div>

              {/* Lignes utilisateurs */}
              {data.users.map((user) => {
                const isUpdating = updatingUser === user.user_id;

                return (
                  <div
                    key={user.user_id}
                    className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700 hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Utilisateur */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt="Avatar"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-white text-xs">
                              {user.first_name?.[0]}
                              {user.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        {user.city && <div className="text-gray-400 text-xs">{user.city}</div>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="text-gray-300 text-sm truncate">{user.auth_users.email}</div>

                    {/* Rôle */}
                    <div className="flex items-center">
                      {isUpdating ? (
                        <div className="text-gray-400 text-xs">Mise à jour...</div>
                      ) : (
                        <select
                          value={user.role_key}
                          onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                          className="px-2 py-1 rounded text-xs text-white border border-gray-600 focus:outline-none"
                          style={{ backgroundColor: "#0f0f0f" }}
                        >
                          <option value="user">User</option>
                          <option value="pro">Pro</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>

                    {/* Dernière connexion */}
                    <div className="text-gray-400 text-xs">
                      {user.auth_users.last_sign_in_at
                        ? formatDate(user.auth_users.last_sign_in_at)
                        : "Jamais"}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination minimaliste */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">{data.pagination.totalCount} utilisateurs</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!data.pagination.hasPrevPage}
              className="px-3 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
            >
              ← Précédent
            </button>
            <span className="text-gray-300 px-2">
              {currentPage} / {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!data.pagination.hasNextPage}
              className="px-3 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
