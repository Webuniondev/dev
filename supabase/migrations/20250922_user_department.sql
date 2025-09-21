-- Migration: Ajout du département pour les adresses utilisateurs
-- Date: 2025-09-22
-- Description: Table des départements français + ajout du champ department_code dans user_profile

-- =====================================================
-- 1. Table des départements français (référence)
-- =====================================================
create table if not exists public.french_departments (
  code text primary key,
  name text not null,
  region text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.french_departments is 'Départements français (liste de référence)';
comment on column public.french_departments.code is 'Code département (01, 02, ..., 2A, 2B, 971, etc.)';
comment on column public.french_departments.name is 'Nom du département (Ain, Aisne, Corse-du-Sud, etc.)';
comment on column public.french_departments.region is 'Région administrative';

-- Seed des départements français (liste complète)
insert into public.french_departments(code, name, region) values
  -- Métropole
  ('01', 'Ain', 'Auvergne-Rhône-Alpes'),
  ('02', 'Aisne', 'Hauts-de-France'),
  ('03', 'Allier', 'Auvergne-Rhône-Alpes'),
  ('04', 'Alpes-de-Haute-Provence', 'Provence-Alpes-Côte d''Azur'),
  ('05', 'Hautes-Alpes', 'Provence-Alpes-Côte d''Azur'),
  ('06', 'Alpes-Maritimes', 'Provence-Alpes-Côte d''Azur'),
  ('07', 'Ardèche', 'Auvergne-Rhône-Alpes'),
  ('08', 'Ardennes', 'Grand Est'),
  ('09', 'Ariège', 'Occitanie'),
  ('10', 'Aube', 'Grand Est'),
  ('11', 'Aude', 'Occitanie'),
  ('12', 'Aveyron', 'Occitanie'),
  ('13', 'Bouches-du-Rhône', 'Provence-Alpes-Côte d''Azur'),
  ('14', 'Calvados', 'Normandie'),
  ('15', 'Cantal', 'Auvergne-Rhône-Alpes'),
  ('16', 'Charente', 'Nouvelle-Aquitaine'),
  ('17', 'Charente-Maritime', 'Nouvelle-Aquitaine'),
  ('18', 'Cher', 'Centre-Val de Loire'),
  ('19', 'Corrèze', 'Nouvelle-Aquitaine'),
  ('21', 'Côte-d''Or', 'Bourgogne-Franche-Comté'),
  ('22', 'Côtes-d''Armor', 'Bretagne'),
  ('23', 'Creuse', 'Nouvelle-Aquitaine'),
  ('24', 'Dordogne', 'Nouvelle-Aquitaine'),
  ('25', 'Doubs', 'Bourgogne-Franche-Comté'),
  ('26', 'Drôme', 'Auvergne-Rhône-Alpes'),
  ('27', 'Eure', 'Normandie'),
  ('28', 'Eure-et-Loir', 'Centre-Val de Loire'),
  ('29', 'Finistère', 'Bretagne'),
  ('30', 'Gard', 'Occitanie'),
  ('31', 'Haute-Garonne', 'Occitanie'),
  ('32', 'Gers', 'Occitanie'),
  ('33', 'Gironde', 'Nouvelle-Aquitaine'),
  ('34', 'Hérault', 'Occitanie'),
  ('35', 'Ille-et-Vilaine', 'Bretagne'),
  ('36', 'Indre', 'Centre-Val de Loire'),
  ('37', 'Indre-et-Loire', 'Centre-Val de Loire'),
  ('38', 'Isère', 'Auvergne-Rhône-Alpes'),
  ('39', 'Jura', 'Bourgogne-Franche-Comté'),
  ('40', 'Landes', 'Nouvelle-Aquitaine'),
  ('41', 'Loir-et-Cher', 'Centre-Val de Loire'),
  ('42', 'Loire', 'Auvergne-Rhône-Alpes'),
  ('43', 'Haute-Loire', 'Auvergne-Rhône-Alpes'),
  ('44', 'Loire-Atlantique', 'Pays de la Loire'),
  ('45', 'Loiret', 'Centre-Val de Loire'),
  ('46', 'Lot', 'Occitanie'),
  ('47', 'Lot-et-Garonne', 'Nouvelle-Aquitaine'),
  ('48', 'Lozère', 'Occitanie'),
  ('49', 'Maine-et-Loire', 'Pays de la Loire'),
  ('50', 'Manche', 'Normandie'),
  ('51', 'Marne', 'Grand Est'),
  ('52', 'Haute-Marne', 'Grand Est'),
  ('53', 'Mayenne', 'Pays de la Loire'),
  ('54', 'Meurthe-et-Moselle', 'Grand Est'),
  ('55', 'Meuse', 'Grand Est'),
  ('56', 'Morbihan', 'Bretagne'),
  ('57', 'Moselle', 'Grand Est'),
  ('58', 'Nièvre', 'Bourgogne-Franche-Comté'),
  ('59', 'Nord', 'Hauts-de-France'),
  ('60', 'Oise', 'Hauts-de-France'),
  ('61', 'Orne', 'Normandie'),
  ('62', 'Pas-de-Calais', 'Hauts-de-France'),
  ('63', 'Puy-de-Dôme', 'Auvergne-Rhône-Alpes'),
  ('64', 'Pyrénées-Atlantiques', 'Nouvelle-Aquitaine'),
  ('65', 'Hautes-Pyrénées', 'Occitanie'),
  ('66', 'Pyrénées-Orientales', 'Occitanie'),
  ('67', 'Bas-Rhin', 'Grand Est'),
  ('68', 'Haut-Rhin', 'Grand Est'),
  ('69', 'Rhône', 'Auvergne-Rhône-Alpes'),
  ('70', 'Haute-Saône', 'Bourgogne-Franche-Comté'),
  ('71', 'Saône-et-Loire', 'Bourgogne-Franche-Comté'),
  ('72', 'Sarthe', 'Pays de la Loire'),
  ('73', 'Savoie', 'Auvergne-Rhône-Alpes'),
  ('74', 'Haute-Savoie', 'Auvergne-Rhône-Alpes'),
  ('75', 'Paris', 'Île-de-France'),
  ('76', 'Seine-Maritime', 'Normandie'),
  ('77', 'Seine-et-Marne', 'Île-de-France'),
  ('78', 'Yvelines', 'Île-de-France'),
  ('79', 'Deux-Sèvres', 'Nouvelle-Aquitaine'),
  ('80', 'Somme', 'Hauts-de-France'),
  ('81', 'Tarn', 'Occitanie'),
  ('82', 'Tarn-et-Garonne', 'Occitanie'),
  ('83', 'Var', 'Provence-Alpes-Côte d''Azur'),
  ('84', 'Vaucluse', 'Provence-Alpes-Côte d''Azur'),
  ('85', 'Vendée', 'Pays de la Loire'),
  ('86', 'Vienne', 'Nouvelle-Aquitaine'),
  ('87', 'Haute-Vienne', 'Nouvelle-Aquitaine'),
  ('88', 'Vosges', 'Grand Est'),
  ('89', 'Yonne', 'Bourgogne-Franche-Comté'),
  ('90', 'Territoire de Belfort', 'Bourgogne-Franche-Comté'),
  ('91', 'Essonne', 'Île-de-France'),
  ('92', 'Hauts-de-Seine', 'Île-de-France'),
  ('93', 'Seine-Saint-Denis', 'Île-de-France'),
  ('94', 'Val-de-Marne', 'Île-de-France'),
  ('95', 'Val-d''Oise', 'Île-de-France'),
  
  -- Corse
  ('2A', 'Corse-du-Sud', 'Corse'),
  ('2B', 'Haute-Corse', 'Corse'),
  
  -- Outre-mer
  ('971', 'Guadeloupe', 'Guadeloupe'),
  ('972', 'Martinique', 'Martinique'),
  ('973', 'Guyane', 'Guyane'),
  ('974', 'La Réunion', 'La Réunion'),
  ('976', 'Mayotte', 'Mayotte')
on conflict (code) do nothing;

-- =====================================================
-- 2. Ajout du département dans user_profile
-- =====================================================
alter table public.user_profile 
add column if not exists department_code text references public.french_departments(code);

comment on column public.user_profile.department_code is 'Code du département français (FK vers french_departments)';

-- Index pour recherche par département
create index if not exists user_profile_department_idx on public.user_profile using btree (department_code);

-- =====================================================
-- 3. Row Level Security pour la table départements
-- =====================================================
alter table public.french_departments enable row level security;

-- Lecture publique des départements (nécessaire pour les selects)
drop policy if exists french_departments_read_all on public.french_departments;
create policy french_departments_read_all on public.french_departments 
for select to anon, authenticated using (true);

-- =====================================================
-- 4. Fonction utilitaire pour déduire le département du code postal
-- =====================================================
create or replace function public.get_department_from_postal_code(postal_code text)
returns text
language plpgsql
immutable
as $$
begin
  -- Gérer les cas spéciaux
  if postal_code is null or length(trim(postal_code)) < 2 then
    return null;
  end if;
  
  -- Normaliser le code postal (enlever espaces, convertir en majuscules)
  postal_code := upper(trim(postal_code));
  
  -- Cas spéciaux Corse
  if substring(postal_code from 1 for 3) in ('200', '201') then
    return '2A'; -- Corse-du-Sud
  elsif substring(postal_code from 1 for 3) in ('202', '206') then
    return '2B'; -- Haute-Corse
  end if;
  
  -- Outre-mer (codes à 5 chiffres)
  if length(postal_code) = 5 and substring(postal_code from 1 for 3) in ('971', '972', '973', '974', '976') then
    return substring(postal_code from 1 for 3);
  end if;
  
  -- Métropole : 2 premiers chiffres
  return substring(postal_code from 1 for 2);
end;
$$;

comment on function public.get_department_from_postal_code is 'Déduit le code département à partir du code postal français';

-- =====================================================
-- 5. Vue enrichie des utilisateurs avec département
-- =====================================================
drop view if exists public.user_profiles_with_location;
create view public.user_profiles_with_location as
select 
  up.*,
  fd.name as department_name,
  fd.region as region_name
from public.user_profile up
left join public.french_departments fd on up.department_code = fd.code;

comment on view public.user_profiles_with_location is 'Utilisateurs avec informations géographiques enrichies';

-- Activer RLS sur la vue (hérite des permissions de user_profile)
alter view public.user_profiles_with_location owner to postgres;
