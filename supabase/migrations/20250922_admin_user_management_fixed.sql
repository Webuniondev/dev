-- Migration corrigée pour la gestion des utilisateurs par les administrateurs
-- Date: 2025-09-22
-- Description: Version corrigée sans ambiguïté de noms

-- Supprimer l'ancienne fonction avec sa signature complète
DROP FUNCTION IF EXISTS admin_list_users(integer,integer,text,text,text,text);
DROP FUNCTION IF EXISTS admin_list_users;

-- 1. Recréer la fonction sans ambiguïté de noms
CREATE OR REPLACE FUNCTION admin_list_users(
    p_page_num INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 10,
    p_search_term TEXT DEFAULT NULL,
    p_role_filter TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'profile_created_at',
    p_sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE(
    return_user_id UUID,
    return_last_name VARCHAR(120),
    return_first_name VARCHAR(120),
    return_address VARCHAR(400),
    return_postal_code VARCHAR(12),
    return_city VARCHAR(160),
    return_phone_number VARCHAR(20),
    return_role_key VARCHAR(50),
    return_department_code CHAR(3),
    return_avatar_url VARCHAR(2048),
    return_profile_created_at TIMESTAMPTZ,
    return_profile_updated_at TIMESTAMPTZ,
    return_department_name VARCHAR(100),
    return_department_region VARCHAR(100),
    return_email VARCHAR(255),
    return_email_confirmed_at TIMESTAMPTZ,
    return_last_sign_in_at TIMESTAMPTZ,
    return_auth_created_at TIMESTAMPTZ,
    return_total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset_val INTEGER;
    v_total_users BIGINT;
    v_calling_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur appelant
    v_calling_user_id := auth.uid();
    
    -- Vérifier que l'utilisateur appelant est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profile up
        WHERE up.user_id = v_calling_user_id AND up.role_key = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Calculer l'offset
    v_offset_val := (p_page_num - 1) * p_page_size;

    -- Compter le total avec filtres
    SELECT COUNT(*) INTO v_total_users
    FROM user_profile up
    LEFT JOIN french_departments fd ON up.department_code = fd.code
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE 1=1
        AND (p_search_term IS NULL OR p_search_term = '' OR (
            LOWER(up.first_name) LIKE LOWER('%' || p_search_term || '%') OR
            LOWER(up.last_name) LIKE LOWER('%' || p_search_term || '%') OR
            LOWER(au.email) LIKE LOWER('%' || p_search_term || '%')
        ))
        AND (p_role_filter IS NULL OR p_role_filter = '' OR up.role_key = p_role_filter);

    -- Retourner les données paginées
    RETURN QUERY
    SELECT 
        up.user_id,
        up.last_name,
        up.first_name,
        up.address,
        up.postal_code,
        up.city,
        up.phone_number,
        up.role_key,
        up.department_code,
        up.avatar_url,
        up.created_at,
        up.updated_at,
        fd.name,
        fd.region,
        au.email,
        au.email_confirmed_at,
        au.last_sign_in_at,
        au.created_at,
        v_total_users
    FROM user_profile up
    LEFT JOIN french_departments fd ON up.department_code = fd.code
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE 1=1
        AND (p_search_term IS NULL OR p_search_term = '' OR (
            LOWER(up.first_name) LIKE LOWER('%' || p_search_term || '%') OR
            LOWER(up.last_name) LIKE LOWER('%' || p_search_term || '%') OR
            LOWER(au.email) LIKE LOWER('%' || p_search_term || '%')
        ))
        AND (p_role_filter IS NULL OR p_role_filter = '' OR up.role_key = p_role_filter)
    ORDER BY 
        CASE WHEN p_sort_by = 'last_name' AND p_sort_order = 'asc' THEN up.last_name END ASC,
        CASE WHEN p_sort_by = 'last_name' AND p_sort_order = 'desc' THEN up.last_name END DESC,
        CASE WHEN p_sort_by = 'profile_created_at' AND p_sort_order = 'asc' THEN up.created_at END ASC,
        CASE WHEN p_sort_by = 'profile_created_at' AND p_sort_order = 'desc' THEN up.created_at END DESC,
        up.created_at DESC -- fallback par défaut
    LIMIT p_page_size OFFSET v_offset_val;

    -- Ajouter une ligne avec le count pour la pagination
    RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TIMESTAMPTZ, v_total_users;
    
END;
$$;

-- Commenter la fonction
COMMENT ON FUNCTION admin_list_users IS 'Fonction RPC corrigée pour lister les utilisateurs avec pagination, filtres et tri (admin seulement). Version sans ambiguïté de noms.';
