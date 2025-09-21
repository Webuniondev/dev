# Migrations Supabase

Scripts SQL versionnés pour la structure de base de données Ourspace.

## Convention de nommage

- `YYYY-MM-DD_description.sql`
- Un fichier par changeset logique
- Migrations idempotentes (IF NOT EXISTS, IF EXISTS)

## Migrations appliquées

### Système utilisateur et rôles

- `20250917_user_profile.sql` - Table profils utilisateurs
- `20250917_user_role.sql` - Système de rôles (user/pro/admin)
- `20250918_user_avatar.sql` - Gestion avatars utilisateurs

### Profils professionnels

- `20250921_pro_profile.sql` - Tables PRO (secteurs, catégories, profils)

### Géolocalisation

- `20250922_user_department.sql` - Départements français et adresses

### Administration

- `20250922_admin_users_clean.sql` - Fonctions RPC admin (gestion utilisateurs)

## Application

### Via Dashboard Supabase

1. Copier le contenu SQL
2. Exécuter dans SQL Editor
3. Vérifier les résultats

### Via CLI (recommandé)

```bash
supabase db push
# ou
supabase migration up
```

## Sécurité

- **RLS activé** sur toutes les tables sensibles
- **Policies strictes** avec principe du moindre privilège
- **Fonctions RPC** sécurisées avec vérification de rôles
- **Triggers** pour validation et audit

## Structure actuelle

### Tables principales

- `user_profile` - Profils utilisateurs avec géolocalisation
- `user_role` - Référentiel des rôles système
- `french_departments` - Départements français (référence)
- `pro_sector` - Secteurs d'activité PRO
- `pro_category` - Catégories d'activité PRO
- `pro_profile` - Profils professionnels enrichis

### Fonctions RPC

- `admin_list_users()` - Liste paginée des utilisateurs
- `admin_update_user_role()` - Modification de rôles
- ~~`become_professional()` - Conversion user → pro~~ (supprimée, création directe désormais)
