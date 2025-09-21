-- Migration: Suppression de la fonction become_professional
-- Raison: Simplification du processus d'inscription professionnelle
-- La création des profils PRO se fait maintenant directement via les API

-- Supprimer la fonction become_professional qui n'est plus utilisée
drop function if exists public.become_professional(uuid, text, text, text, text, integer);

-- Sécurisation supplémentaire: si une version sans signature existe
drop function if exists public.become_professional;

-- Note: Les autres fonctions et triggers restent en place car ils sont toujours utiles :
-- - can_create_pro_profile() : validation métier
-- - validate_pro_role() : trigger de nettoyage lors de changements de rôle  
-- - check_pro_profile_required() : validation de complétude
