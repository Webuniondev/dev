-- Simplification création PRO: lever le blocage d'ordre d'insertion
-- Objectif: permettre l'inscription en plusieurs étapes sans RPC complexe
-- Stratégie: autoriser l'insertion dans pro_profile avant le passage du rôle à PRO,
-- puis s'assurer via un trigger AFTER sur user_profile que les PRO possèdent bien un pro_profile.

-- 1) Supprimer le trigger BEFORE INSERT qui impose déjà PRO pour pro_profile
drop trigger if exists pro_profile_validate on public.pro_profile;
drop function if exists public.validate_pro_profile();

-- 2) Renforcer la vérification côté user_profile (déjà en place: check_pro_profile_required)
-- Idempotent: (re)crée la fonction et le trigger si nécessaire
create or replace function public.check_pro_profile_required()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.role_key = 'pro' and (OLD is null or OLD.role_key <> 'pro') then
    if not exists (
      select 1 from public.pro_profile pp where pp.user_id = NEW.user_id
    ) then
      raise exception 'Un utilisateur PRO doit avoir un profil professionnel (catégorie + secteur).';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists user_profile_require_pro_profile on public.user_profile;
create trigger user_profile_require_pro_profile
after insert or update on public.user_profile
for each row when (NEW.role_key = 'pro')
execute function public.check_pro_profile_required();

comment on function public.check_pro_profile_required is 'Vérifie qu''un utilisateur PRO possède un pro_profile (contrôle à l''activation du rôle).';


