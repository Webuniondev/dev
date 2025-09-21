import { NextRequest } from "next/server";

import { withApiProtection } from "@/lib/api-security";
import { supabaseServer } from "@/lib/supabase/server";

// Types pour la réponse RPC (fonction admin_list_users propre)
interface RpcUserRow {
  user_id: string | null;
  last_name: string | null;
  first_name: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  phone_number: string | null;
  role_key: string | null;
  department_code: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  department_name: string | null;
  department_region: string | null;
  email: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  auth_created_at: string | null;
  total_count: number | null;
}

interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: "created_at" | "last_name" | "role_key";
  sortOrder?: "asc" | "desc";
}

async function getUsersList(request: NextRequest) {
  try {
    const supabase = await supabaseServer({ readOnly: true });

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profile")
      .select("role_key")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.role_key !== "admin") {
      return Response.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const params: UserListParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      sortBy: (searchParams.get("sortBy") as UserListParams["sortBy"]) || "created_at",
      sortOrder: (searchParams.get("sortOrder") as UserListParams["sortOrder"]) || "desc",
    };

    // Utiliser la fonction RPC admin_list_users (version propre)
    const { data: rawUsers, error } = (await supabase.rpc("admin_list_users", {
      page_num: params.page,
      page_size: params.limit,
      search_term: params.search || null,
      role_filter: params.role || null,
      sort_by: params.sortBy === "created_at" ? "created_at" : params.sortBy,
      sort_order: params.sortOrder,
    })) as { data: RpcUserRow[] | null; error: unknown };

    if (error) {
      console.error("Erreur RPC admin_list_users:", error);
      throw error;
    }

    // Séparer les données et le count
    const users = rawUsers?.filter((u: RpcUserRow) => u.user_id !== null) || [];
    const countRow = rawUsers?.find((u: RpcUserRow) => u.user_id === null);
    const count = countRow?.total_count || 0;

    // Transformer les données pour correspondre au format attendu
    const transformedUsers = users.map((user: RpcUserRow) => ({
      user_id: user.user_id,
      last_name: user.last_name,
      first_name: user.first_name,
      address: user.address,
      postal_code: user.postal_code,
      city: user.city,
      phone_number: user.phone_number,
      role_key: user.role_key,
      department_code: user.department_code,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      auth_users: {
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.auth_created_at,
      },
      french_departments: user.department_name
        ? {
            name: user.department_name,
            region: user.department_region,
          }
        : null,
    }));

    // Calculer les métadonnées de pagination
    const limit = params.limit || 10;
    const page = params.page || 1;
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return Response.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: count,
          limit: limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search: params.search,
          role: params.role,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return Response.json(
      {
        error: "Erreur serveur lors de la récupération des utilisateurs",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

export const GET = withApiProtection(getUsersList);
