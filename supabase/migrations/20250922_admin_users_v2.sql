-- Migration alternative: nouvelle fonction avec nom différent
-- Date: 2025-09-22
-- Description: Fonction complètement nouvelle pour éviter les conflits

-- Créer une nouvelle fonction avec un nom différent
CREATE OR REPLACE FUNCTION admin_get_users_list(
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 10,
    p_search TEXT DEFAULT NULL,
    p_role TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE(
    user_id UUID,
    last_name TEXT,
    first_name TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    phone_number TEXT,
    role_key TEXT,
    department_code TEXT,
    avatar_url TEXT,
    profile_created_at TIMESTAMPTZ,
    profile_updated_at TIMESTAMPTZ,
    department_name TEXT,
    department_region TEXT,
    email TEXT,
    email_confirmed_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    auth_created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_val INTEGER;
    total_users BIGINT;
    calling_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur appelant
    calling_user_id := auth.uid();
    
    -- Vérifier que l'utilisateur appelant est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profile up
        WHERE up.user_id = calling_user_id AND up.role_key = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Calculer l'offset
    offset_val := (p_page - 1) * p_limit;

    -- Compter le total avec filtres
    SELECT COUNT(*) INTO total_users
    FROM user_profile profile
    LEFT JOIN french_departments dept ON profile.department_code = dept.code
    LEFT JOIN auth.users auth_user ON profile.user_id = auth_user.id
    WHERE 1=1
        AND (p_search IS NULL OR p_search = '' OR (
            LOWER(profile.first_name) LIKE LOWER('%' || p_search || '%') OR
            LOWER(profile.last_name) LIKE LOWER('%' || p_search || '%') OR
            LOWER(auth_user.email) LIKE LOWER('%' || p_search || '%')
        ))
        AND (p_role IS NULL OR p_role = '' OR profile.role_key = p_role);

    -- Retourner les données paginées
    RETURN QUERY
    SELECT 
        profile.user_id,
        profile.last_name,
        profile.first_name,
        profile.address,
        profile.postal_code,
        profile.city,
        profile.phone_number,
        profile.role_key,
        profile.department_code,
        profile.avatar_url,
        profile.created_at,
        profile.updated_at,
        dept.name,
        dept.region,
        auth_user.email,
        auth_user.email_confirmed_at,
        auth_user.last_sign_in_at,
        auth_user.created_at,
        total_users
    FROM user_profile profile
    LEFT JOIN french_departments dept ON profile.department_code = dept.code
    LEFT JOIN auth.users auth_user ON profile.user_id = auth_user.id
    WHERE 1=1
        AND (p_search IS NULL OR p_search = '' OR (
            LOWER(profile.first_name) LIKE LOWER('%' || p_search || '%') OR
            LOWER(profile.last_name) LIKE LOWER('%' || p_search || '%') OR
            LOWER(auth_user.email) LIKE LOWER('%' || p_search || '%')
        ))
        AND (p_role IS NULL OR p_role = '' OR profile.role_key = p_role)
    ORDER BY 
        CASE WHEN p_sort_by = 'last_name' AND p_sort_order = 'asc' THEN profile.last_name END ASC,
        CASE WHEN p_sort_by = 'last_name' AND p_sort_order = 'desc' THEN profile.last_name END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN profile.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN profile.created_at END DESC,
        profile.created_at DESC
    LIMIT p_limit OFFSET offset_val;

    -- Ajouter une ligne avec le total pour la pagination
    RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TIMESTAMPTZ, total_users;
    
END;
$$;

COMMENT ON FUNCTION admin_get_users_list IS 'Fonction RPC v2 pour lister les utilisateurs avec pagination, filtres et tri (admin seulement). Noms de colonnes simples sans préfixes.';
