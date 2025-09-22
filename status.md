## Statut du projet

Dernière mise à jour: 22/09/2025

### État actuel

- **Base technique**: Next.js (App Router) + TS + Tailwind v4 + shadcn/ui: ✅ OK
- **Sécurité**: CSP middleware + Sentry + API protection: ✅ OK
- **Base de données**: Supabase avec RLS, policies et migrations: ✅ OK
- **Authentification**: Système de rôles complet (user/pro/admin): ✅ OK
- **Administration**: Interface complète de gestion utilisateurs: ✅ OK
- **Profils PRO**: Tables spécialisées avec catégories/secteurs: ✅ OK
- **Géolocalisation**: Départements français intégrés: ✅ OK
- **APIs sécurisées**: Routes protégées avec validation Zod: ✅ OK
- **Hooks sécurisés**: `useSecureFetch` pour requêtes client: ✅ OK
- **Interface moderne**: Dark theme, responsive, optimisé: ✅ OK

### Mises à jour récentes

- Autocomplétion de la recherche (services + départements) intégrée à `DualSearch` (accueil + sticky). Chargement paresseux, navigation clavier, accessibilité ARIA, sécurisée via `useSecureFetch`.
- Autocomplétion séparée « Catégories » et « Services » avec en‑têtes contrastés; `onSubmit` expose désormais `sectorKey` ou `categoryKey` selon la sélection.

### À faire (prochaines étapes)

#### Priorité 1 - Fonctionnalités métier

- **Recherche/mise en relation**: Algorithme intelligent pro ↔ client
- **Google Maps**: API autocomplétion adresses (structure DB prête)
- **Messagerie**: Communication sécurisée entre utilisateurs
- **Évaluations**: Système d'avis et de notation

#### Priorité 2 - Intégrations

- **Stripe**: Paiements, abonnements PRO, webhooks signés
- **Email**: Service transactionnel (notifications, invitations)
- **Upload fichiers**: Images profil, documents, galeries

#### Priorité 3 - Technique

- **Tests**: Jest + RTL + MSW avec coverage >80%
- **Performance**: Bundle analyzer, optimisations images
- **Monitoring**: Logs détaillés, métriques, alertes
- **CI/CD**: Pipeline déploiement automatisé

### Budgets de bundle (enforcés en CI)

- First Load gzip (page publique): 200 KB max
- Chunk individuel gzip: 150 KB max
- Check automatique: `.github/workflows/ci.yml` exécute `npm run bundle:check`
- Ajustement local: `BUNDLE_PAGE=/page BUNDLE_BUDGET_FIRSTLOAD_KB=200 BUNDLE_BUDGET_CHUNK_KB=150 npm run bundle:check`

### Notes

- Secrets toujours côté serveur; utiliser `src/lib/supabase/admin.ts` uniquement dans des Route Handlers/Server Actions
- Valider tous les payloads/outputs avec Zod; journaliser les erreurs avec Sentry
- Préférer RSC et routes serveur; éviter d’exposer de la logique sensible aux composants client
