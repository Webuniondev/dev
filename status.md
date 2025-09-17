## Statut du projet

Dernière mise à jour: 17/09/2025

### État actuel

- Base Next.js (App Router) + TS + Tailwind v4 + shadcn/ui: OK
- Sécurité: CSP middleware (dev permissif, prod strict) + Sentry tunnel: OK
- Données: Supabase SDK (browser/server/admin): OK — CSP autorise l’origine Supabase
- Validation: Zod aux frontières API: OK (ex: `POST /api/echo`)
- Client: React Query provider + exemple Zustand: OK
- Opérations: CI (lint + build) + bundle analyzer: OK
- Pages d’erreur/fallbacks: OK

### À faire (prochaines étapes)

- Définir tables et policies RLS (least‑privilege) et versionner les migrations
- Ajouter base de tests (Jest + RTL + MSW) et coverage minimal
- Intégration Stripe (webhooks signés + Customer Portal) [à planifier]
- Budgets de bundle et alertes analyzer (seuils gzip)

### Budgets de bundle (enforcés en CI)

- First Load gzip (page publique): 200 KB max
- Chunk individuel gzip: 150 KB max
- Check automatique: `.github/workflows/ci.yml` exécute `npm run bundle:check`
- Ajustement local: `BUNDLE_PAGE=/page BUNDLE_BUDGET_FIRSTLOAD_KB=200 BUNDLE_BUDGET_CHUNK_KB=150 npm run bundle:check`

### Notes

- Secrets toujours côté serveur; utiliser `src/lib/supabase/admin.ts` uniquement dans des Route Handlers/Server Actions
- Valider tous les payloads/outputs avec Zod; journaliser les erreurs avec Sentry
- Préférer RSC et routes serveur; éviter d’exposer de la logique sensible aux composants client
