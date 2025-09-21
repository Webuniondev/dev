-- Fichier de seed optionnel pour les données PRO
-- À exécuter manuellement si besoin des exemples de secteurs/catégories

-- =====================================================
-- Seed des secteurs d'activité (exemples)
-- =====================================================
insert into public.pro_sector(key, label, description) values
  ('artisanat', 'Artisanat', 'Métiers manuels et techniques'),
  ('services', 'Services', 'Services aux particuliers et entreprises'),
  ('conseil', 'Conseil', 'Expertise et accompagnement'),
  ('numerique', 'Numérique', 'Technologies et digital'),
  ('sante', 'Santé & Bien-être', 'Soins et accompagnement santé'),
  ('education', 'Éducation', 'Formation et enseignement')
on conflict (key) do nothing;

-- =====================================================
-- Seed des catégories (exemples)
-- =====================================================
insert into public.pro_category(key, label, sector_key, description) values
  -- Artisanat
  ('plomberie', 'Plomberie', 'artisanat', 'Installation et réparation plomberie'),
  ('electricite', 'Électricité', 'artisanat', 'Installation électrique et dépannage'),
  ('menuiserie', 'Menuiserie', 'artisanat', 'Travaux bois et aménagement'),
  ('peinture', 'Peinture', 'artisanat', 'Peinture et décoration'),
  ('maconnerie', 'Maçonnerie', 'artisanat', 'Gros œuvre et rénovation'),
  
  -- Services
  ('menage', 'Ménage & Entretien', 'services', 'Nettoyage domicile et bureaux'),
  ('jardinage', 'Jardinage', 'services', 'Entretien espaces verts'),
  ('demenagement', 'Déménagement', 'services', 'Transport et logistique'),
  ('garde-enfants', 'Garde d''enfants', 'services', 'Accompagnement enfants'),
  ('photographie', 'Photographie', 'services', 'Événements et portraits'),
  
  -- Conseil
  ('comptabilite', 'Comptabilité', 'conseil', 'Gestion financière et fiscale'),
  ('juridique', 'Juridique', 'conseil', 'Conseil et accompagnement juridique'),
  ('rh', 'Ressources Humaines', 'conseil', 'Conseil RH et recrutement'),
  
  -- Numérique
  ('dev-web', 'Développement Web', 'numerique', 'Sites web et applications'),
  ('graphisme', 'Graphisme', 'numerique', 'Design et communication visuelle'),
  ('marketing', 'Marketing Digital', 'numerique', 'Stratégie digitale et SEO'),
  
  -- Santé
  ('massage', 'Massage', 'sante', 'Bien-être et relaxation'),
  ('coaching-sport', 'Coaching Sportif', 'sante', 'Entraînement et fitness'),
  ('nutrition', 'Nutrition', 'sante', 'Conseil alimentaire et diététique'),
  
  -- Éducation
  ('cours-particuliers', 'Cours Particuliers', 'education', 'Soutien scolaire et formation'),
  ('formation-pro', 'Formation Professionnelle', 'education', 'Développement compétences'),
  ('langues', 'Langues', 'education', 'Apprentissage langues étrangères')
on conflict (key) do nothing;
