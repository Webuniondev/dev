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
