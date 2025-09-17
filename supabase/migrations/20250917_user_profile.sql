-- user_profile: profil étendu lié à auth.users
-- Bonne pratiques (sept. 2025):
-- - PK = user_id (uuid) référencé à auth.users
-- - Timestamps normalisés (created_at, updated_at) en UTC
-- - Contraintes de validation simples (longueurs, formats)
-- - Index pertinents (recherche par ville, code postal)
-- - RLS strictes: chaque utilisateur lit/écrit uniquement son profil

create table if not exists public.user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_name text not null check (char_length(trim(last_name)) between 1 and 120),
  first_name text not null check (char_length(trim(first_name)) between 1 and 120),
  address text,
  postal_code text check (postal_code ~ '^[0-9A-Za-z\-\s]{3,12}$'),
  city text,
  phone_number text check (phone_number ~ '^[0-9+().\-\s]{5,20}$'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.user_profile is 'Extended user profile linked to auth.users (one-to-one).';
comment on column public.user_profile.user_id is 'FK to auth.users(id).';
comment on column public.user_profile.last_name is 'Nom';
comment on column public.user_profile.first_name is 'Prénom';
comment on column public.user_profile.address is 'Adresse';
comment on column public.user_profile.postal_code is 'Code postal';
comment on column public.user_profile.city is 'Ville';
comment on column public.user_profile.phone_number is 'Numéro de téléphone';

-- Index pour recherches éventuelles
create index if not exists user_profile_city_idx on public.user_profile using btree (city);
create index if not exists user_profile_postal_code_idx on public.user_profile using btree (postal_code);

-- Trigger de mise à jour updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;$$;

drop trigger if exists user_profile_set_updated_at on public.user_profile;
create trigger user_profile_set_updated_at
before update on public.user_profile
for each row execute function public.set_updated_at();

-- RLS
alter table public.user_profile enable row level security;

-- Accès lecture/écriture uniquement pour le propriétaire (auth.uid())
create policy user_profile_select_own
on public.user_profile
for select
to authenticated
using (auth.uid() = user_id);

create policy user_profile_upsert_own
on public.user_profile
for insert
to authenticated
with check (auth.uid() = user_id);

create policy user_profile_update_own
on public.user_profile
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optionnel: permettre la création automatique du profil via rpc/trigger post‑signup (à implémenter ultérieurement)


