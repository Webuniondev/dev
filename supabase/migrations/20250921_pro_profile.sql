-- Migration: Support profil professionnel
-- Date: 2025-09-21
-- Description: Tables pour catégories, secteurs et profils PRO

-- =====================================================
-- 1. Table des secteurs d'activité (référence)
-- =====================================================
create table if not exists public.pro_sector (
  key text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.pro_sector is 'Secteurs d''activité pour les professionnels';
comment on column public.pro_sector.key is 'Identifiant unique du secteur (ex: artisanat, services)';
comment on column public.pro_sector.label is 'Libellé affiché (ex: Artisanat, Services)';

-- Pas de seed automatique - les données seront ajoutées manuellement

-- =====================================================
-- 2. Table des catégories (référence)
-- =====================================================
create table if not exists public.pro_category (
  key text primary key,
  label text not null,
  sector_key text not null references public.pro_sector(key),
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.pro_category is 'Catégories de services pour les professionnels';
comment on column public.pro_category.key is 'Identifiant unique de la catégorie';
comment on column public.pro_category.label is 'Libellé affiché';
comment on column public.pro_category.sector_key is 'Secteur parent';

-- Index pour recherche par secteur
create index if not exists pro_category_sector_idx on public.pro_category using btree (sector_key);

-- Pas de seed automatique - les catégories seront ajoutées selon les besoins

-- =====================================================
-- 3. Table profil professionnel (données PRO uniquement)
-- =====================================================
create table if not exists public.pro_profile (
  user_id uuid primary key references public.user_profile(user_id) on delete cascade,
  category_key text not null references public.pro_category(key),
  sector_key text not null references public.pro_sector(key),
  
  -- Champs métier PRO
  business_name text, -- Nom entreprise/marque
  description text, -- Description activité
  experience_years integer check (experience_years >= 0 and experience_years <= 50),
  
  -- Timestamps
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.pro_profile is 'Profil professionnel - uniquement pour role_key = pro';
comment on column public.pro_profile.user_id is 'FK vers user_profile (doit être role_key = pro)';
comment on column public.pro_profile.category_key is 'Catégorie principale d''activité';
comment on column public.pro_profile.sector_key is 'Secteur d''activité (doit correspondre à category.sector_key)';
comment on column public.pro_profile.business_name is 'Nom commercial ou raison sociale';
comment on column public.pro_profile.description is 'Description de l''activité et services';
comment on column public.pro_profile.experience_years is 'Années d''expérience';

-- =====================================================
-- 4. Fonctions de validation métier
-- =====================================================

-- Fonction pour valider qu'un utilisateur est PRO
create or replace function public.validate_pro_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Vérifier que l'utilisateur est PRO
  if not exists (
    select 1 from public.user_profile up 
    where up.user_id = NEW.user_id 
    and up.role_key = 'pro'
  ) then
    raise exception 'Seuls les utilisateurs avec le rôle PRO peuvent avoir un profil professionnel';
  end if;

  -- Vérifier la cohérence secteur/catégorie
  if not exists (
    select 1 from public.pro_category pc 
    where pc.key = NEW.category_key 
    and pc.sector_key = NEW.sector_key
  ) then
    raise exception 'La catégorie % ne correspond pas au secteur %', NEW.category_key, NEW.sector_key;
  end if;

  return NEW;
end;
$$;

-- =====================================================
-- 5. Index pour performances
-- =====================================================
create index if not exists pro_profile_category_idx on public.pro_profile using btree (category_key);
create index if not exists pro_profile_sector_idx on public.pro_profile using btree (sector_key);
create index if not exists pro_profile_created_idx on public.pro_profile using btree (created_at desc);

-- =====================================================
-- 6. Triggers de validation et maintenance
-- =====================================================

-- Trigger de validation métier (avant insert/update)
drop trigger if exists pro_profile_validate on public.pro_profile;
create trigger pro_profile_validate
before insert or update on public.pro_profile
for each row execute function public.validate_pro_profile();

-- Trigger auto-update timestamp
drop trigger if exists pro_profile_set_updated_at on public.pro_profile;
create trigger pro_profile_set_updated_at
before update on public.pro_profile
for each row execute function public.set_updated_at();

-- =====================================================
-- 7. Row Level Security (RLS)
-- =====================================================

-- Tables de référence: lecture publique
alter table public.pro_sector enable row level security;
drop policy if exists pro_sector_read_all on public.pro_sector;
create policy pro_sector_read_all on public.pro_sector for select to anon, authenticated using (true);

alter table public.pro_category enable row level security;
drop policy if exists pro_category_read_all on public.pro_category;
create policy pro_category_read_all on public.pro_category for select to anon, authenticated using (true);

-- pro_profile: accès restreint aux PRO propriétaires + admins
alter table public.pro_profile enable row level security;

-- Lecture: propriétaire PRO + admins + lecture publique pour recherche
drop policy if exists pro_profile_select_public on public.pro_profile;
create policy pro_profile_select_public on public.pro_profile 
for select to anon, authenticated 
using (true); -- Permet recherche publique des pros

-- Écriture: propriétaire PRO uniquement
drop policy if exists pro_profile_owner_write on public.pro_profile;
create policy pro_profile_owner_write on public.pro_profile 
for all to authenticated 
using (
  auth.uid() = user_id 
  and exists (
    select 1 from public.user_profile up 
    where up.user_id = auth.uid() 
    and up.role_key = 'pro'
  )
)
with check (
  auth.uid() = user_id 
  and exists (
    select 1 from public.user_profile up 
    where up.user_id = auth.uid() 
    and up.role_key = 'pro'
  )
);

-- =====================================================
-- 8. Fonctions et triggers pour gérer les utilisateurs PRO
-- =====================================================

-- Fonction pour vérifier si un user peut créer un pro_profile
create or replace function public.can_create_pro_profile(target_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.user_profile up 
    where up.user_id = target_user_id 
    and up.role_key = 'pro'
    and not exists (
      select 1 from public.pro_profile pp 
      where pp.user_id = target_user_id
    )
  );
end;
$$;

-- Fonction pour valider qu'un utilisateur PRO a un profil professionnel complet
create or replace function public.validate_pro_role()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si l'utilisateur devient PRO (nouveau ou changement de rôle)
  if NEW.role_key = 'pro' and (OLD is null or OLD.role_key != 'pro') then
    -- Vérifier qu'il a un profil professionnel complet
    -- On utilise un délai pour permettre la transaction de se compléter
    -- Cette vérification sera faite dans un trigger AFTER
    null;
  end if;

  -- Si l'utilisateur était PRO et change de rôle, supprimer le profil PRO
  if OLD is not null and OLD.role_key = 'pro' and NEW.role_key != 'pro' then
    delete from public.pro_profile where user_id = NEW.user_id;
  end if;

  return NEW;
end;
$$;

-- Fonction pour vérifier que les PRO ont un profil complet (AFTER trigger)
create or replace function public.check_pro_profile_required()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si l'utilisateur vient de devenir PRO, vérifier qu'il a un profil
  if NEW.role_key = 'pro' and (OLD is null or OLD.role_key != 'pro') then
    -- Vérifier si un profil PRO existe déjà
    if not exists (
      select 1 from public.pro_profile pp 
      where pp.user_id = NEW.user_id
    ) then
      raise exception 'Un utilisateur PRO doit avoir un profil professionnel avec une catégorie et un secteur d''activité';
    end if;
  end if;

  return NEW;
end;
$$;

-- Trigger sur user_profile pour gérer les changements de rôle PRO
drop trigger if exists user_profile_pro_role_change on public.user_profile;
create trigger user_profile_pro_role_change
after insert or update of role_key on public.user_profile
for each row execute function public.validate_pro_role();

-- Trigger pour vérifier que les PRO ont un profil complet
drop trigger if exists user_profile_check_pro_complete on public.user_profile;
create trigger user_profile_check_pro_complete
after insert or update of role_key on public.user_profile
for each row 
when (NEW.role_key = 'pro')
execute function public.check_pro_profile_required();

-- Vue pour les utilisateurs PRO avec leur profil (facilitera les requêtes)
drop view if exists public.pro_users;
create view public.pro_users as
select 
  up.user_id,
  up.first_name,
  up.last_name,
  up.city,
  up.postal_code,
  up.avatar_url,
  pp.category_key,
  pp.sector_key,
  pp.business_name,
  pp.description,
  pp.experience_years,
  pc.label as category_label,
  ps.label as sector_label,
  up.created_at as user_created_at,
  pp.created_at as pro_profile_created_at
from public.user_profile up
inner join public.pro_profile pp on up.user_id = pp.user_id
inner join public.pro_category pc on pp.category_key = pc.key
inner join public.pro_sector ps on pp.sector_key = ps.key
where up.role_key = 'pro';

comment on view public.pro_users is 'Vue des utilisateurs PRO avec leurs profils professionnels (seulement ceux avec profil complet)';

-- Fonction RPC pour devenir professionnel de manière atomique
create or replace function public.become_professional(
  target_user_id uuid,
  category_key text,
  sector_key text,
  business_name text default null,
  description text default null,
  experience_years integer default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Vérifier que l'utilisateur existe et n'est pas déjà PRO
  if not exists (
    select 1 from public.user_profile 
    where user_id = target_user_id and role_key != 'pro'
  ) then
    raise exception 'Utilisateur introuvable ou déjà professionnel';
  end if;

  -- Vérifier que la catégorie existe et correspond au secteur
  if not exists (
    select 1 from public.pro_category pc 
    where pc.key = category_key and pc.sector_key = sector_key
  ) then
    raise exception 'Catégorie ou secteur invalide';
  end if;

  -- Transaction atomique : 
  -- 1. Créer d'abord le profil professionnel
  insert into public.pro_profile (
    user_id, category_key, sector_key, business_name, description, experience_years
  ) values (
    target_user_id, category_key, sector_key, business_name, description, experience_years
  );

  -- 2. Puis changer le rôle en PRO (maintenant le trigger de validation passera)
  update public.user_profile 
  set role_key = 'pro', updated_at = timezone('utc', now())
  where user_id = target_user_id;
end;
$$;

comment on function public.become_professional is 'Transforme un utilisateur en professionnel avec profil obligatoire (transaction atomique)';
comment on function public.can_create_pro_profile is 'Vérifie si un utilisateur peut créer un profil professionnel';
comment on function public.validate_pro_role is 'Gère les changements de rôle PRO et nettoie les profils si nécessaire';
comment on function public.check_pro_profile_required is 'Vérifie qu''un utilisateur PRO a un profil professionnel complet';
