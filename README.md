## Ourspace Web – Stack & Guide

Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui + Radix + React Query + Zod + Sentry.

### Démarrer

```bash
npm install
npm run dev
# http://localhost:3000
```

### Ce qui est déjà en place
- Tailwind v4 (via `@tailwindcss/postcss`), `src/app/globals.css` avec container util.
- shadcn/ui + Radix, composants de base dans `src/components/ui/*`.
- CSP via middleware (`src/middleware.ts`) avec mode dev permissif et prod strict; domaine Sentry autorisé.
- Sentry côté client/serveur/edge (`sentry.*.config.ts`) + tunnel `/api/monitoring`.
- React Query provider (`src/app/providers.tsx`) monté dans `app/layout.tsx`.
- Zod installé + exemples de schémas (`src/lib/validation/user.ts`).
- Exemple d’API validée `POST /api/echo` avec Zod.
- Supabase SDK configuré: `src/lib/supabase/{client,server,admin}.ts`.
- ESLint + Prettier + tri d’imports, scripts `npm run lint` et `npm run format`.

### Variables d’environnement (.env.local)

```
# Sentry
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_RELEASE=prod
SENTRY_ENV=production
NEXT_PUBLIC_SENTRY_RELEASE=prod
NEXT_PUBLIC_SENTRY_ENV=production

# Supabase (à compléter)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...

# Stripe (à compléter)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Règles & Sécurité
- Données sensibles uniquement côté serveur (Route Handlers/Server Actions).
- Valider toutes les entrées/sorties avec Zod.
- CSP stricte en prod; ajuster si des domaines externes sont requis.

## Supabase – Configuration et bonnes pratiques

### SDK et helpers
- Client navigateur: `src/lib/supabase/client.ts`
  - Usage: `const supabase = supabaseBrowser()` dans un composant client.
- Client serveur (App Router): `src/lib/supabase/server.ts`
  - Cookies gérés via `next/headers` (forme asynchrone).
  - Usage: `const supabase = await supabaseServer()` dans un Route Handler/Server Action.
- Client admin (service role): `src/lib/supabase/admin.ts`
  - Usage serveur uniquement (jamais côté client) pour tâches privilégiées (backfills, webhooks).

### Variables d’environnement (rappel)
- Côté client: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Côté serveur uniquement: `SUPABASE_SERVICE_ROLE`.
- Ne jamais exposer la service role au client.

### RLS (Row Level Security) – à mettre en place
1) Activer RLS sur chaque table concernée.
2) Écrire des policies strictes (least‑privilege). Exemple type « propriétaire »:

```sql
-- Exemple: table profiles(owner uuid, ...)
alter table profiles enable row level security;

-- Lecture pour l’utilisateur connecté sur ses propres lignes
create policy "read own profile"
on profiles for select
to authenticated
using (auth.uid() = owner);

-- Écriture pour l’utilisateur connecté sur ses propres lignes
create policy "modify own profile"
on profiles for all
to authenticated
using (auth.uid() = owner)
with check (auth.uid() = owner);
```

3) Tester les policies via le SQL Editor et/ou en appelant l’API avec `anon` (public) et un JWT d’utilisateur.

### Frontières serveur/clients
- Opérations sensibles (écriture, accès étendu) via Route Handlers/Server Actions avec `supabaseServer()` ou `supabaseAdmin()`.
- Côté client, utiliser de préférence la lecture non sensible (cache React Query) et passer par des routes serveur pour tout ce qui touche des privilèges.

### Validation I/O
- Toujours valider les payloads d’entrée et les réponses avec Zod aux frontières (voir `src/app/api/echo/route.ts`).

### Intégration Stripe (prochaine étape)
- Webhook en route serveur (`app/api/stripe/webhook/route.ts`).
- Vérifier la signature (secret) et synchroniser l’état d’abonnement dans Supabase.
- Customer Portal côté client via un endpoint serveur qui crée la session.

### Tests & vérifications à prévoir
- Tests de policies RLS (lecture/écriture anonymes vs authentifiés).
- Tests d’intégration sur Route Handlers avec Zod et Supabase mock/stub si besoin.


### À faire (extrait de `doc.txt`)
- Configurer Supabase SDK (client/server) et documenter RLS/policies.
- Définir RLS et policies minimales.
- Configurer Stripe SDK, Customer Portal et webhooks (signature vérifiée).
- Mettre un store Zustand d’exemple.
- Optimiser les images avec `next/image` (WebP/AVIF, tailles).
- Ajouter pages d’erreur/fallbacks (`app/error.tsx`, `app/not-found.tsx`) + Suspense.
- Ajouter la base de tests (Jest/RTL/MSW).
- Ajouter CI basique (lint + test) et `@next/bundle-analyzer`.
- Préparer `.env.local.example` et tenir `README/status.md` à jour.

### Liens utiles
- Next.js docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
