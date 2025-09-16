# Supabase – Guide de configuration et pratiques

Ce document complète le README pour la partie Supabase: variables, helpers, RLS, tests, opérations.

## Variables d’environnement

- NEXT_PUBLIC_SUPABASE_URL: URL du projet Supabase (publique)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: clé anon (publique)
- SUPABASE_SERVICE_ROLE: service role key (serveur uniquement)

Voir `.env.local.example` à la racine pour un modèle.

## Helpers SDK

- Navigateur: `src/lib/supabase/client.ts`
  - `const supabase = supabaseBrowser()` dans un composant client.
- Serveur (App Router): `src/lib/supabase/server.ts`
  - `const supabase = await supabaseServer()` dans un Route Handler/Server Action.
- Admin (service role): `src/lib/supabase/admin.ts` (serveur uniquement)
  - Pour tâches privilégiées (webhooks Stripe, backfills, scripts d’admin).

## RLS – approche recommandée

1) Activer RLS par table (least‑privilege). 
2) Définir des policies explicites (lecture/écriture séparées).
3) Tester chaque policy (anon vs authenticated) avant mise en prod.

Exemples de patterns (à adapter à votre schéma):

- Propriétaire: `auth.uid() = owner`
- Lecture publique mais écriture propriétaire: `select` pour `anon/authenticated`, `insert/update/delete` restreints
- Tables système/admin: accès via `supabaseAdmin()` côté serveur uniquement

NB: Les policies s’exécutent côté Supabase. Versionnez vos DDL/policies et appliquez‑les via le Dashboard (SQL Editor) ou Supabase CLI (migrations).

## Tests de policies

- Tester avec l’anon key (attendu: accès limité) et avec un JWT utilisateur (accès autorisé selon les policies)
- Couvrir: SELECT, INSERT, UPDATE, DELETE, et fonctions RPC si utilisées

## Frontières serveur vs client

- Écritures et accès sensibles: Route Handlers/Server Actions via `supabaseServer()` ou `supabaseAdmin()`
- Client: lectures non sensibles; sinon passer par une route serveur

## Sécurité

- Ne jamais exposer `SUPABASE_SERVICE_ROLE` côté client
- Logger les erreurs (Sentry déjà configuré) et masquer les détails côté client

## Opérations & migrations

- Placez vos scripts SQL dans `supabase/migrations/` (voir README du dossier)
- Nommer les fichiers avec timestamp + description (ex: `2025-09-16_profiles_policies.sql`)
- Documenter les rollbacks et penser à la rétro‑compatibilité



