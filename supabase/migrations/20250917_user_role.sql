-- Table de référence des rôles utilisateurs
create table if not exists public.user_role (
  key text primary key,
  label text not null
);

-- Seed basique
insert into public.user_role(key, label) values
  ('user', 'Utilisateur'),
  ('pro', 'Professionnel'),
  ('admin', 'Administrateur')
on conflict (key) do nothing;

comment on table public.user_role is 'Liste blanche des rôles applicatifs';

-- Ajouter une colonne role_key sur user_profile
alter table public.user_profile
  add column if not exists role_key text not null default 'user' references public.user_role(key);

-- Index rapide
create index if not exists user_profile_role_idx on public.user_profile using btree (role_key);

-- RLS: lecture publique des rôles (pas sensible)
alter table public.user_role enable row level security;
create policy user_role_read_all on public.user_role for select to anon, authenticated using (true);


