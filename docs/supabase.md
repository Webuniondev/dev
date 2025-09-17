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

1. Activer RLS par table (least‑privilege).
2. Définir des policies explicites (lecture/écriture séparées).
3. Tester chaque policy (anon vs authenticated) avant mise en prod.

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

## Schéma: user_profile (liée à auth.users)

Table: `public.user_profile`
- Clé primaire: `user_id uuid` (FK `auth.users(id)`, cascade delete)
- Champs: `last_name`, `first_name`, `address`, `postal_code`, `city`, `phone_number`, `created_at`, `updated_at`
- Contraintes: longueurs/regex sur `postal_code` et `phone_number`
- Index: `city`, `postal_code`
- Trigger: `updated_at` auto (UTC)
- RLS: propriétaire seulement (select/insert/update où `auth.uid() = user_id`)
- Rôle: colonne `role_key` (FK `public.user_role(key)`) défaut `user`

Fichier de migration: `supabase/migrations/20250917_user_profile.sql`

## Schéma: user_role (liste blanche)

Table: `public.user_role`
- `key` (PK): `user | pro | admin`
- `label`: libellé affichable
- RLS: lecture publique (table non sensible)

Fichier de migration: `supabase/migrations/20250917_user_role.sql`

Tests recommandés:
- Anon: `select`/`insert`/`update` → refusés
- Auth utilisateur A: `select`/`upsert`/`update` sur `user_id = A` → autorisés; `user_id = B` → refusés
- Admin (service role via serveur): accès privilégié si nécessaire dans des opérations backend uniquement

### Schéma Zod associé

Source: `src/lib/validation/user.ts`

```ts
export const profileUpsertSchema = z.object({
  last_name: z.string().min(1).max(120),
  first_name: z.string().min(1).max(120),
  address: z.string().max(400).optional().or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  postal_code: z.string().regex(/^[0-9A-Za-z\-\s]{3,12}$/).optional(),
  city: z.string().max(160).optional(),
  phone_number: z.string().regex(/^[0-9+().\-\s]{5,20}$/).optional(),
});
```

Correspondance champs ↔ colonnes table `public.user_profile`:
- `last_name` ↔ `last_name`
- `first_name` ↔ `first_name`
- `address` ↔ `address`
- `postal_code` ↔ `postal_code`
- `city` ↔ `city`
- `phone_number` ↔ `phone_number`
- `role_key` ↔ `role_key` (FK user_role)
