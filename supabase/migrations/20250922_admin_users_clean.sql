-- Migration propre pour la gestion des utilisateurs par les administrateurs
-- Date: 2025-09-22
-- Description: Version propre respectant les types exacts de la base de données

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS admin_list_users(integer,integer,text,text,text,text);
DROP FUNCTION IF EXISTS admin_list_users;

-- Créer la fonction avec les types exacts des colonnes de la base
CREATE OR REPLACE FUNCTION admin_list_users(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    search_term TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'desc'
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
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
        SELECT 1 FROM user_profile 
        WHERE user_profile.user_id = calling_user_id AND user_profile.role_key = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Calculer l'offset
    offset_val := (page_num - 1) * page_size;

    -- Compter le total avec filtres
    SELECT COUNT(*) INTO total_users
    FROM user_profile up
    LEFT JOIN french_departments fd ON up.department_code = fd.code
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE 1=1
        AND (search_term IS NULL OR search_term = '' OR (
            LOWER(up.first_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(up.last_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(au.email) LIKE LOWER('%' || search_term || '%')
        ))
        AND (role_filter IS NULL OR role_filter = '' OR up.role_key = role_filter);

    -- Retourner les données paginées avec cast explicite pour éviter les conflits de types
    RETURN QUERY
    SELECT 
        up.user_id::UUID,
        up.last_name::TEXT,
        up.first_name::TEXT,
        up.address::TEXT,
        up.postal_code::TEXT,
        up.city::TEXT,
        up.phone_number::TEXT,
        up.role_key::TEXT,
        up.department_code::TEXT,
        up.avatar_url::TEXT,
        up.created_at::TIMESTAMPTZ,
        up.updated_at::TIMESTAMPTZ,
        fd.name::TEXT,
        fd.region::TEXT,
        au.email::TEXT,
        au.email_confirmed_at::TIMESTAMPTZ,
        au.last_sign_in_at::TIMESTAMPTZ,
        au.created_at::TIMESTAMPTZ,
        total_users::BIGINT
    FROM user_profile up
    LEFT JOIN french_departments fd ON up.department_code = fd.code
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE 1=1
        AND (search_term IS NULL OR search_term = '' OR (
            LOWER(up.first_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(up.last_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(au.email) LIKE LOWER('%' || search_term || '%')
        ))
        AND (role_filter IS NULL OR role_filter = '' OR up.role_key = role_filter)
    ORDER BY 
        CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN up.last_name END ASC,
        CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN up.last_name END DESC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN up.created_at END ASC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN up.created_at END DESC,
        up.created_at DESC
    LIMIT page_size OFFSET offset_val;

    -- Ajouter une ligne avec le total pour la pagination
    RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TIMESTAMPTZ, total_users::BIGINT;
    
END;
$$;

COMMENT ON FUNCTION admin_list_users IS 'Fonction RPC pour lister les utilisateurs avec pagination, filtres et tri (admin seulement). Version propre avec types cohérents.';
