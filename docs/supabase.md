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

Cela remplace l'ancien wildcard `*.supabase.co`.

## Récupération de mot de passe (Password Recovery)

### Vue d'ensemble

Implémentation complète du flux de récupération de mot de passe utilisant l'API Supabase Auth avec redirection personnalisée et validation renforcée.

### Architecture du flux

```
Page connexion → Mot de passe oublié → Email + callback → Nouveau mot de passe
     ↓                    ↓                   ↓                    ↓
 /login            /forgot-password     /auth/callback      /reset-password
"Mot de passe      Saisie email +      Exchange code       Critères stricts +
 oublié ?"         validation Zod      for session         validation temps réel
```

### Pages et composants créés

#### 1. `/forgot-password` - Demande de récupération

- **Style** : Glassmorphism identique à `/login` et `/register`
- **Validation** : Email via Zod (`forgotPasswordSchema`)
- **Server Action** : `resetPasswordRequest` avec `supabase.auth.resetPasswordForEmail`
- **Gestion d'erreurs** : Rate limiting (`over_email_send_rate_limit`) et erreurs réseau
- **Redirection** : Vers `/auth/callback?next=/reset-password&type=recovery`

#### 2. `/auth/callback` - Échange de code

- **API Route** : `src/app/auth/callback/route.ts`
- **Fonction** : Exchange `code` parameter pour session active
- **Redirection** : Vers `next` URL (typiquement `/reset-password`)
- **Fallback** : Vers `/forgot-password` avec message d'erreur

#### 3. `/reset-password` - Nouveau mot de passe

- **Composant principal** : `ResetPasswordForm` (client) + `ResetRecoveryBridge`
- **Validation** : Critères stricts temps réel (8+ chars, majuscule, chiffre)
- **Server Action** : `updatePassword` avec double validation
- **Sécurité** : Déconnexion forcée après changement

### Composants clés

#### `ResetPasswordForm` - Validation intelligente

```typescript
// Critères de validation stricts
const hasMinLength = password.length >= 8;
const hasUppercase = /[A-Z]/.test(password);
const hasNumber = /[0-9]/.test(password);

const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
const doPasswordsMatch = password === confirmPassword && password.length > 0;
const isFormValid = isPasswordValid && doPasswordsMatch;

// Bouton désactivé si critères non respectés
<Button disabled={!isFormValid || isSubmitting}>
```

#### `ResetRecoveryBridge` - Session multi-format

```typescript
// Gestion de 4 formats de récupération Supabase :
// 1. code (standard) → exchangeCodeForSession
// 2. access_token + refresh_token (hash) → setSession
// 3. token_hash (search params) → verifyOtp
// 4. token (legacy) → verifyOtp fallback
```

### Validation Zod et sécurité

#### Schemas de validation

```typescript
// src/lib/validation/user.ts

// Demande de récupération
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Réinitialisation avec critères stricts
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
```

#### Gestion d'erreurs spécifiques

- **Rate limiting (429)** : "Trop de demandes. Veuillez attendre."
- **Token expiré** : Redirection vers `/forgot-password`
- **Même mot de passe (`same_password`)** : Message explicite
- **Session manquante** : Bridge de récupération multi-méthodes
- **Validation temps réel** : Feedback visuel par critère

### Configuration email Supabase

Template HTML avec design Ourspace dans **Auth > Email Templates > Reset Password** :

```html
<a
  href="{{ .ConfirmationURL }}"
  style="background: white; color: #1a202c; padding: 12px 24px; border-radius: 6px;"
>
  Réinitialiser mon mot de passe
</a>
```

**Redirect URL configurée** : `${SITE_URL}/auth/callback?next=/reset-password&type=recovery`

### Fichiers créés/modifiés

**Pages nouvelles :**

- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/auth/callback/route.ts`

**Composants nouveaux :**

- `src/components/reset-password-form.tsx`
- `src/components/reset-recovery-bridge.tsx`

**Modifications :**

- `src/app/login/page.tsx` (lien "Mot de passe oublié ?")
- `src/lib/validation/user.ts` (schemas)
- `src/components/auth-welcome-listener.tsx` (pas de toast sur reset)
- `src/middleware.ts` (simplification)

### Tests recommandés

1. **Flux nominal** : Demande → Email → Nouveau mot de passe → Connexion
2. **Rate limiting** : Demandes multiples → Message d'attente
3. **Critères password** : Validation temps réel + serveur
4. **Sécurité** : Pas d'accès direct `/reset-password`, déconnexion forcée

## Footer et navigation

### Vue d'ensemble

Footer moderne avec design cohérent au header, navigation complète et responsive design optimisé.

### Conception et style

#### Design cohérent avec le header

- **Couleur** : `bg-black text-white` (identique au header)
- **Police** : `font-archivo-black` pour le nom OURSPACE
- **Bordure** : `border-t` (au lieu de `border-b` du header)
- **Hauteur** : Structure flexible avec padding `py-[10px]`
- **Glassmorphism** : Bouton Centre d'aide avec effet glass

#### Layout responsive

**Desktop/Tablette :**

```
OURSPACE  │  Politique confidentialité  Mentions légales  FAQ  Tarifs  │  [Centre d'aide]
```

**Mobile :**

```
OURSPACE                    [Centre d'aide]
────────────────────────────────────────────
Politique confidentialité    FAQ
Mentions légales             Tarifs
```

### Structure et composants

#### Composant principal (`SiteFooter`)

```typescript
// src/components/site-footer.tsx

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-black text-white py-[10px]">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Nom de l'entreprise à gauche */}
        <div className="flex items-center">
          <span className="text-lg font-archivo-black">OURSPACE</span>
        </div>

        {/* Centre - Tous les liens avec espacement uniforme */}
        <div className="hidden sm:flex items-center gap-12">
          <Link href="/politique-confidentialite">Politique de confidentialité</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/tarifs">Tarifs</Link>
        </div>

        {/* Bouton centre d'aide à droite */}
        <Button variant="outline" className="border-white bg-white text-black hover:bg-white/90">
          <Link href="/centre-aide" className="flex items-center gap-2">
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline">Centre d'aide</span>
          </Link>
        </Button>
      </div>

      {/* Version mobile */}
      <div className="sm:hidden border-t border-white/10">
        <div className="container mx-auto px-4 py-[10px]">
          <div className="grid grid-cols-2 gap-4 text-xs text-white/80">
            {/* Liens organisés en 2 colonnes */}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

#### Intégration dans les pages publiques

**Pages concernées :**

- `src/app/page.tsx` (Homepage)
- `src/app/services/page.tsx` (Services)

**Pattern d'intégration :**

```typescript
// Structure des pages publiques
<div className="min-h-dvh flex flex-col">
  <SiteHeader />
  <main className="flex-1">
    {/* Contenu de la page */}
  </main>
  <SiteFooter />
</div>
```

### Navigation et liens

#### Liens disponibles

1. **Politique de confidentialité** (`/politique-confidentialite`)
2. **Mentions légales** (`/mentions-legales`)
3. **FAQ** (`/faq`)
4. **Tarifs** (`/tarifs`)
5. **Centre d'aide** (`/centre-aide`) - Bouton avec icône

#### Espacement et hiérarchie

- **Gap uniforme** : `gap-12` (48px) entre tous les liens
- **Ordre logique** : Liens légaux → Informations pratiques → Support
- **Accessibilité** : Zones tactiles ≥44px, contrastes conformes

### Responsive design

#### Breakpoints et adaptation

**Desktop (≥640px) :**

- Tous les liens en ligne horizontale
- Espacement uniforme avec `gap-12`
- Bouton Centre d'aide avec texte visible

**Mobile (<640px) :**

- Header avec OURSPACE + bouton Centre d'aide (icône seule)
- Section séparée avec liens en grid 2 colonnes
- Centrage vertical et horizontal optimal

#### Styles adaptatifs

```scss
// Pattern utilisé
.hidden sm:flex         // Caché mobile, flex desktop
.sm:hidden             // Visible mobile, caché desktop
.sm:inline            // Texte visible uniquement desktop
```

### Accessibilité et UX

#### Standards appliqués

- **Sémantique** : Balise `<footer>` avec structure claire
- **Navigation clavier** : Tous les liens focusables
- **Contrastes** : Texte blanc sur fond noir (ratio optimal)
- **Zones tactiles** : Boutons et liens ≥44px de hauteur

#### Transitions et interactions

- **Hover effects** : `hover:text-white` pour les liens
- **Bouton Centre d'aide** : Effet glassmorphism avec `hover:bg-white/90`
- **Transitions fluides** : `transition-colors` sur tous les éléments interactifs

### Maintenance et évolution

#### Fichiers à modifier pour ajouter des liens

1. **Desktop** : Section `gap-12` dans `SiteFooter`
2. **Mobile** : Grid `grid-cols-2` dans la section mobile
3. **Routes** : Créer les pages correspondantes dans `src/app/`

#### Bonnes pratiques

- **Cohérence visuelle** : Maintenir l'alignement avec le header
- **Performance** : Liens internes uniquement (pas de redirections externes)
- **SEO** : Structure sémantique et liens internes pour l'indexation
