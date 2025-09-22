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
- **Nouveau:** `department_code char(3)` (FK `public.french_departments(code)`)
- Contraintes: longueurs/regex sur `postal_code` et `phone_number`
- Index: `city`, `postal_code`, `department_code`
- Trigger: `updated_at` auto (UTC)
- RLS: propriétaire seulement (select/insert/update où `auth.uid() = user_id`)
- Rôle: colonne `role_key` (FK `public.user_role(key)`) défaut `user`
- Avatar: `avatar_url text` (URL publique du bucket `avatars`)

Fichiers de migration:

- `supabase/migrations/20250917_user_profile.sql` (profil de base)
- `supabase/migrations/20250918_user_avatar.sql` (avatars)
- `supabase/migrations/20250922_user_department.sql` (départements)

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
  avatar_url: z.string().url().max(2048).optional(),
});

## Stockage avatars (bucket)

- Bucket: `avatars` (public: true)
- Policies:
  - `select` pour tout le monde sur ce bucket (lecture publique)
  - `all` pour l’utilisateur authentifié limité à son dossier `avatars/{auth.uid()}/*`
- Chemin recommandé: `avatars/{user_id}/{timestamp}_{filename}`
- Lors de l’upload, mettre à jour `public.user_profile.avatar_url` avec l’URL publique
```

## Schéma: french_departments (référence géographique)

Table: `public.french_departments`

- Clé primaire: `code char(3)` (ex: "75", "2A", "971")
- Champs: `name varchar(100)`, `region varchar(100)`
- **101 départements** incluant métropole et outre-mer
- RLS: lecture publique (données de référence)
- Utilisée pour: validation des adresses utilisateurs

Fichier de migration: `supabase/migrations/20250922_user_department.sql`

Vue associée: `user_profiles_with_location` (jointure user_profile + department)
RPC associée: `get_department_from_postal_code(postal_code text)` → code département

## Schéma: pro_profile (utilisateurs professionnels)

Tables professionnelles (pour `role_key = 'pro'` uniquement):

### `public.pro_sector`

- Clé primaire: `key varchar(50)` (ex: "services", "commerce")
- Champs: `label varchar(100)`, `description text`
- RLS: lecture publique

### `public.pro_category`

- Clé primaire: `key varchar(50)` (ex: "plomberie", "electricite")
- Champs: `label varchar(100)`, `description text`, `sector_key varchar(50)` (FK pro_sector)
- RLS: lecture publique

### `public.pro_profile`

- Clé primaire: `user_id uuid` (FK auth.users(id), FK user_profile(user_id))
- Champs: `category_key varchar(50)` (FK pro_category), `sector_key varchar(50)` (FK pro_sector)
- **Contraintes:** Obligatoires pour les utilisateurs PRO via triggers PostgreSQL
- **Validation:** Cohérence category.sector_key = pro_profile.sector_key
- RLS: propriétaire seulement

Fichiers de migration:

- `supabase/migrations/20250921_pro_profile.sql` (tables + triggers + RPC)
- `supabase/migrations/20250921_pro_profile_seeds.sql` (données d'exemple)

Création directe: Insertion directe dans `user_profile` (role_key='pro') + `pro_profile`

### Schéma Zod associé

Source: `src/lib/validation/user.ts`

```ts
// Schéma de base (mis à jour)
export const profileUpsertSchema = z.object({
  last_name: z.string().min(1).max(120),
  first_name: z.string().min(1).max(120),
  address: z
    .string()
    .max(400)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  postal_code: z
    .string()
    .regex(/^[0-9A-Za-z\-\s]{3,12}$/)
    .optional(),
  city: z.string().max(160).optional(),
  phone_number: z
    .string()
    .regex(/^[0-9+().\-\s]{5,20}$/)
    .optional(),
  avatar_url: z.string().url().max(2048).optional(),
  department_code: z
    .string()
    .regex(/^[0-9A-B]{2,3}$/)
    .optional(), // Nouveau
});

// Schémas PRO (nouveaux)
export const proSectorSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const proCategorySchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  description: z.string().optional(),
  sector_key: z.string().min(1).max(50),
});

export const proProfileCreateSchema = z.object({
  category_key: z.string().min(1).max(50),
  sector_key: z.string().min(1).max(50),
});

// Schémas départements (nouveaux)
export const frenchDepartmentSchema = z.object({
  code: z.string().regex(/^[0-9A-B]{2,3}$/),
  name: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
});
```

## API Routes créées

### Administration

- `GET /api/admin/user-stats` - Statistiques utilisateurs (admin uniquement)
  - Métriques: total, actifs (30j), PRO, admins
  - Sécurisée avec `withApiProtection`
- `GET /api/admin/users` - Liste complète des utilisateurs avec pagination
  - Paramètres: `page`, `limit`, `search`, `role`, `sortBy`, `sortOrder`
  - Utilise la fonction RPC `admin_list_users()` pour accès sécurisé
  - Retourne: utilisateurs + métadonnées pagination
- `POST /api/admin/user-role` - Mise à jour du rôle utilisateur
  - Corps: `{ userId: UUID, role_key: 'user'|'pro'|'admin' }`
  - Utilise la fonction RPC `admin_update_user_role()` avec validations
  - Protection: impossible de se rétrograder soi-même

### Données professionnelles

- `GET /api/pro-data` - Secteurs et catégories PRO
- `GET|POST|PUT|DELETE /api/pro-profile` - CRUD profil PRO
- (Supprimé) `POST /api/become-pro` - remplacé par l’API d’inscription `/api/register` (création simplifiée en 3 étapes)

### Données géographiques

- `GET /api/departments` - Liste des départements français
  - Regroupés par région, sécurisé admin

## Sécurité API

Middleware de protection: `src/lib/api-security.ts`

- Validation Origin et headers `X-Requested-With`
- Filtrage User-Agent malveillant
- Hook client: `useSecureFetch` (ajout automatique headers)

Correspondance champs ↔ colonnes table `public.user_profile`:

- `last_name` ↔ `last_name`
- `first_name` ↔ `first_name`
- `address` ↔ `address`
- `postal_code` ↔ `postal_code`
- `city` ↔ `city`
- `phone_number` ↔ `phone_number`
- `role_key` ↔ `role_key` (FK user_role)
- `department_code` ↔ `department_code` (FK french_departments)

## Gestion des utilisateurs (Administration)

### Migration `20250922_admin_user_management.sql`

#### Vue `admin_users_view`

Vue sécurisée combinant `user_profile`, `auth.users` et `french_departments` pour l'administration.

#### Fonctions RPC Admin

##### `admin_list_users()`

```sql
admin_list_users(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    search_term TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'profile_created_at',
    sort_order TEXT DEFAULT 'desc'
)
```

- **Sécurité** : Vérification rôle admin obligatoire
- **Retour** : Colonnes préfixées `result_*` pour éviter ambiguïtés de noms
- **Pagination** : Ligne séparée avec `total_count` pour métadonnées
- **Filtres** : Recherche ILIKE sur nom/prénom/email, filtre exact par rôle
- **Tri** : Par date création ou nom avec direction ASC/DESC
- **Correction v2** : Résolution conflit noms colonnes SQL/PL-pgSQL

##### `admin_update_user_role()`

```sql
admin_update_user_role(
    target_user_id UUID,
    new_role_key TEXT ('user'|'pro'|'admin')
)
```

- **Sécurité** : Vérification rôle admin, protection auto-rétrogradation
- **Validations** : Rôle valide, utilisateur cible existe
- **Retour** : JSON avec ancien/nouveau rôle et timestamp

### Composants UI

#### `UsersManagement` (`src/components/users-management.tsx`)

Interface complète de gestion des utilisateurs:

- **Recherche/Filtres** : Nom, email, rôle
- **Pagination** : Navigation fluide
- **Actions** : Changement de rôle en temps réel
- **Affichage** : Infos utilisateur, statut, localisation
- **Sécurité** : Toutes les requêtes via `useSecureFetch`

#### APIs dédiées

- `GET /api/admin/users` : Liste avec pagination/filtres
- `POST /api/admin/user-role` : Modification de rôle
- `POST /api/admin/create-admin` : Création d'administrateur
- Toutes sécurisées avec `withApiProtection` + vérification admin

## API `/api/admin/create-admin`

### Fonctionnalité

Création sécurisée d'un utilisateur administrateur avec validation complète et transaction atomique.

### Sécurité

- **Authentification** : Admin uniquement
- **Validation** : Schéma Zod strict
- **Unicité** : Vérification email via `listUsers()`
- **Transaction** : Création auth + profil atomique
- **Rollback** : Suppression auto en cas d'erreur

### Schema de validation

```typescript
{
  email: string (email valide),
  password: string (min 8 caractères),
  first_name: string (1-120 caractères),
  last_name: string (1-120 caractères),
  phone_number?: string (format international)
}
```

### Processus de création

1. Validation des données d'entrée
2. Vérification unicité email
3. Création utilisateur auth avec `createUser()`
4. Création profil avec rôle `admin`
5. Rollback automatique si erreur

### Interface utilisateur

- **Modal** : `CreateAdminModal` avec design dark
- **Formulaire** : Validation temps réel
- **UX** : Messages succès/erreur, fermeture auto
- **Intégration** : Bouton dans page `/administration/utilisateurs`

## Système d'inscription utilisateur/professionnel

### Fonctionnalité

Inscription unifiée permettant aux utilisateurs de choisir entre un compte particulier ou professionnel dès l'inscription, avec formulaires adaptés et création de profil complète.

### Architecture du flux

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Choix type    │ -> │   Formulaire     │ -> │    Succès       │
│  ☐ Particulier  │    │    adapté        │    │                 │
│  ☐ Professionnel│    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Composants UI

#### `AccountTypeSelector`

Sélecteur de type de compte avec design cards :

- **Particulier** : Icône User, recherche de professionnels
- **Professionnel** : Icône Briefcase, proposition de services

#### `UserRegistrationForm`

Formulaire simplifié pour particuliers :

- Champs de base : nom, prénom, email, mot de passe
- Téléphone optionnel
- Validation Zod côté client et serveur

#### `ProRegistrationForm`

Formulaire complet pour professionnels :

- Champs de base + champs métier
- Sélection secteur/catégorie dynamique
- Informations business : nom entreprise, expérience, description
- Validation cohérence secteur ↔ catégorie

#### `RegistrationSuccess`

Page de confirmation avec actions :

- Message adapté au type de compte
- Boutons vers connexion et accueil
- Info spéciale pour les professionnels

### APIs

#### `GET /api/pro-data`

Récupération des secteurs et catégories pour l'inscription PRO :

```typescript
{
  sectors: [{
    key: string,
    label: string,
    description?: string,
    categories: ProCategory[]
  }]
}
```

#### `POST /api/register`

API unifiée d'inscription avec schéma discriminant :

```typescript
// Type particulier
{
  account_type: "user",
  email, password, first_name, last_name,
  phone_number?, department_code?, address?, city?, postal_code?
}

// Type professionnel
{
  account_type: "pro",
  email, password, first_name, last_name,
  category_key, sector_key, business_name?, description?, experience_years?,
  phone_number?, department_code?, address?, city?, postal_code?
}
```

### Logique backend

#### Inscription particulier

1. Création utilisateur auth (`createUser`)
2. Création profil avec `role_key = 'user'`
3. Retour succès avec données utilisateur

#### Inscription professionnel (création simplifiée)

1. Création utilisateur auth (`createUser`)
2. Création `user_profile` avec `role_key='user'` (temporaire)
3. Création `pro_profile` avec secteur/catégorie (obligatoires)
4. Upgrade du rôle: `user_profile.role_key='pro'`
   - Trigger `check_pro_profile_required` impose la présence d'un `pro_profile` au passage en `pro`.

### Sécurité

- **Client admin** : Utilisation `supabaseAdmin()` pour création
- **Validation** : Schémas Zod stricts côté API
- **Unicité email** : Vérification via `listUsers()`
- **Triggers actifs** : `check_pro_profile_required` (AFTER sur `user_profile`)
- **Triggers retirés** : `validate_pro_profile` (verrou poule/œuf résolu)
- **Transaction atomique** : Rollback automatique si erreur
- **Cohérence métier** : Validation secteur ↔ catégorie

### Données de référence

Migration `20250922_pro_data_seeds.sql` avec secteurs de base :

- **Services** : Ménage, jardinage, garde d'enfants, cours
- **Artisanat** : Couture, menuiserie, bijouterie, poterie
- **Bâtiment** : Plomberie, électricité, peinture, carrelage
- **Digital** : Développement web, design, marketing, photo
- **Santé & Bien-être** : Massage, coaching, fitness, nutrition

### Admin list users – version active

Signature exacte (RETURNS TABLE) de la fonction SQL actuellement déployée:

```sql
admin_list_users(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    search_term TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'profile_created_at',
    sort_order TEXT DEFAULT 'desc'
) RETURNS TABLE (
    user_id UUID,
    last_name TEXT,
    first_name TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    phone_number TEXT,
    role_key TEXT,
    department_code TEXT,
    avatar_url TEXT,
    profile_created_at TIMESTAMPTZ,
    profile_updated_at TIMESTAMPTZ,
    department_name TEXT,
    department_region TEXT,
    email TEXT,
    email_confirmed_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    auth_created_at TIMESTAMPTZ,
    total_count BIGINT
);
```

Exemple de réponse JSON (après mapping côté API):

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "6f5d...",
        "last_name": "Dupont",
        "first_name": "Jean",
        "address": null,
        "postal_code": null,
        "city": "Paris",
        "phone_number": "+33...",
        "role_key": "user",
        "department_code": "75",
        "avatar_url": null,
        "created_at": "2025-09-22T12:34:56.000Z",
        "updated_at": "2025-09-22T12:35:10.000Z",
        "auth_users": {
          "email": "jean@example.com",
          "email_confirmed_at": null,
          "last_sign_in_at": null,
          "created_at": "2025-09-22T12:34:50.000Z"
        },
        "french_departments": {
          "name": "Paris",
          "region": "Île-de-France"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "filters": { "search": null, "role": null, "sortBy": "created_at", "sortOrder": "desc" }
  },
  "lastUpdated": "2025-09-22T12:40:00.000Z"
}
```

### Note Next.js images (hostname précis)

Pour `next/image`, limiter l’hôte aux fichiers de votre projet Supabase afin de réduire la surface d’attaque et respecter les bonnes pratiques:

```ts
// next.config.ts
const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
export default {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" },
    ],
  },
};
```

Cela remplace l’ancien wildcard `*.supabase.co`.
