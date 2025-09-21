-- Migration pour la gestion des utilisateurs par les administrateurs
-- Date: 2025-09-22
-- Description: Création d'une vue sécurisée et de fonctions RPC pour la gestion des utilisateurs

-- 1. Créer une vue pour les administrateurs qui combine user_profile et auth.users
CREATE OR REPLACE VIEW admin_users_view AS
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
    up.created_at as profile_created_at,
    up.updated_at as profile_updated_at,
    -- Informations du département
    fd.name as department_name,
    fd.region as department_region,
    -- Informations auth (limitées pour la sécurité)
    au.email,
    au.email_confirmed_at,
    au.last_sign_in_at,
    au.created_at as auth_created_at
FROM user_profile up
LEFT JOIN french_departments fd ON up.department_code = fd.code
LEFT JOIN auth.users au ON up.user_id = au.id;

-- 2. Fonction RPC pour lister les utilisateurs avec pagination et filtres
CREATE OR REPLACE FUNCTION admin_list_users(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    search_term TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'profile_created_at',
    sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE(
    result_user_id UUID,
    result_last_name TEXT,
    result_first_name TEXT,
    result_address TEXT,
    result_postal_code TEXT,
    result_city TEXT,
    result_phone_number TEXT,
    result_role_key TEXT,
    result_department_code TEXT,
    result_avatar_url TEXT,
    result_profile_created_at TIMESTAMPTZ,
    result_profile_updated_at TIMESTAMPTZ,
    result_department_name TEXT,
    result_department_region TEXT,
    result_email TEXT,
    result_email_confirmed_at TIMESTAMPTZ,
    result_last_sign_in_at TIMESTAMPTZ,
    result_auth_created_at TIMESTAMPTZ,
    result_total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_val INTEGER;
    total_users BIGINT;
    sort_column TEXT;
    sort_direction TEXT;
BEGIN
    -- Vérifier que l'utilisateur appelant est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profile 
        WHERE user_profile.user_id = auth.uid() AND user_profile.role_key = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Calculer l'offset
    offset_val := (page_num - 1) * page_size;

    -- Valider et définir le tri
    sort_column := CASE 
        WHEN sort_by = 'last_name' THEN 'vu.last_name'
        WHEN sort_by = 'profile_created_at' THEN 'vu.profile_created_at'
        ELSE 'vu.profile_created_at'
    END;
    
    sort_direction := CASE 
        WHEN sort_order = 'asc' THEN 'ASC'
        ELSE 'DESC'
    END;

    -- Compter le total avec filtres
    SELECT COUNT(*) INTO total_users
    FROM admin_users_view vu
    WHERE 1=1
        AND (search_term IS NULL OR search_term = '' OR (
            LOWER(vu.first_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(vu.last_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(vu.email) LIKE LOWER('%' || search_term || '%')
        ))
        AND (role_filter IS NULL OR role_filter = '' OR vu.role_key = role_filter);

    -- Retourner les données paginées
    RETURN QUERY
    SELECT 
        vu.user_id,
        vu.last_name,
        vu.first_name,
        vu.address,
        vu.postal_code,
        vu.city,
        vu.phone_number,
        vu.role_key,
        vu.department_code,
        vu.avatar_url,
        vu.profile_created_at,
        vu.profile_updated_at,
        vu.department_name,
        vu.department_region,
        vu.email,
        vu.email_confirmed_at,
        vu.last_sign_in_at,
        vu.auth_created_at,
        total_users
    FROM admin_users_view vu
    WHERE 1=1
        AND (search_term IS NULL OR search_term = '' OR (
            LOWER(vu.first_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(vu.last_name) LIKE LOWER('%' || search_term || '%') OR
            LOWER(vu.email) LIKE LOWER('%' || search_term || '%')
        ))
        AND (role_filter IS NULL OR role_filter = '' OR vu.role_key = role_filter)
    ORDER BY 
        CASE WHEN sort_by = 'last_name' AND sort_order = 'asc' THEN vu.last_name END ASC,
        CASE WHEN sort_by = 'last_name' AND sort_order = 'desc' THEN vu.last_name END DESC,
        CASE WHEN sort_by = 'profile_created_at' AND sort_order = 'asc' THEN vu.profile_created_at END ASC,
        CASE WHEN sort_by = 'profile_created_at' AND sort_order = 'desc' THEN vu.profile_created_at END DESC,
        vu.profile_created_at DESC -- fallback par défaut
    LIMIT page_size OFFSET offset_val;

    -- Ajouter une ligne avec le count pour la pagination (avec des NULL pour les autres colonnes)
    RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 
        NULL::TIMESTAMPTZ, total_users;
    
END;
$$;

-- 3. Fonction RPC pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION admin_update_user_role(
    target_user_id UUID,
    new_role_key TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_id UUID;
    old_role_key TEXT;
    result JSON;
BEGIN
    -- Récupérer l'ID de l'utilisateur appelant
    calling_user_id := auth.uid();
    
    -- Vérifier que l'utilisateur appelant est admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profile 
        WHERE user_id = calling_user_id AND role_key = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Vérifier que le nouveau rôle est valide
    IF new_role_key NOT IN ('user', 'pro', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role_key;
    END IF;

    -- Empêcher un admin de se rétrograder lui-même
    IF target_user_id = calling_user_id AND new_role_key != 'admin' THEN
        RAISE EXCEPTION 'Cannot downgrade your own admin role';
    END IF;

    -- Récupérer l'ancien rôle
    SELECT role_key INTO old_role_key
    FROM user_profile
    WHERE user_id = target_user_id;

    IF old_role_key IS NULL THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;

    -- Mettre à jour le rôle
    UPDATE user_profile
    SET 
        role_key = new_role_key,
        updated_at = NOW()
    WHERE user_id = target_user_id;

    -- Retourner le résultat
    SELECT json_build_object(
        'success', true,
        'user_id', target_user_id,
        'old_role', old_role_key,
        'new_role', new_role_key,
        'updated_at', NOW()
    ) INTO result;

    RETURN result;
END;
$$;

-- 4. Permissions RLS
-- La vue admin_users_view hérite des permissions RLS des tables sous-jacentes
-- Les fonctions RPC ont SECURITY DEFINER et vérifient manuellement les permissions

-- Commenter sur les nouvelles fonctions
COMMENT ON VIEW admin_users_view IS 'Vue sécurisée pour les administrateurs listant tous les utilisateurs avec leurs informations';
COMMENT ON FUNCTION admin_list_users IS 'Fonction RPC pour lister les utilisateurs avec pagination, filtres et tri (admin seulement)';
COMMENT ON FUNCTION admin_update_user_role IS 'Fonction RPC pour mettre à jour le rôle d''un utilisateur (admin seulement)';
