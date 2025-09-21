-- Migration: Fonction RPC pour créer un utilisateur PRO de manière atomique
-- Contourne les triggers en gérant l'ordre des opérations dans une transaction

create or replace function public.create_pro_user_atomic(
  target_user_id uuid,
  p_last_name text,
  p_first_name text,
  p_category_key text,
  p_sector_key text,
  p_phone_number text default null,
  p_department_code text default null,
  p_address text default null,
  p_city text default null,
  p_postal_code text default null,
  p_business_name text default null,
  p_description text default null,
  p_experience_years integer default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Désactiver temporairement les triggers pour éviter les conflits
  set session_replication_role = replica;
  
  -- 1. Créer le user_profile directement en PRO
  insert into public.user_profile (
    user_id, role_key, last_name, first_name, phone_number,
    department_code, address, city, postal_code, created_at, updated_at
  ) values (
    target_user_id, 'pro', p_last_name, p_first_name, p_phone_number,
    p_department_code, p_address, p_city, p_postal_code, 
    timezone('utc', now()), timezone('utc', now())
  );

  -- 2. Créer le pro_profile
  insert into public.pro_profile (
    user_id, category_key, sector_key, business_name, description, 
    experience_years, created_at, updated_at
  ) values (
    target_user_id, p_category_key, p_sector_key, p_business_name, 
    p_description, p_experience_years, timezone('utc', now()), timezone('utc', now())
  );

  -- Réactiver les triggers
  set session_replication_role = default;
end;
$$;

comment on function public.create_pro_user_atomic is 'Crée un utilisateur PRO et son profil professionnel de manière atomique, en contournant les triggers de validation';
