-- Migration: Données de base pour secteurs et catégories PRO
-- Date: 2025-09-22
-- Description: Insertion des secteurs et catégories de base pour les tests

-- =====================================================
-- Secteurs d'activité de base
-- =====================================================
INSERT INTO public.pro_sector (key, label, description) VALUES 
  ('services', 'Services', 'Services aux particuliers et aux entreprises'),
  ('artisanat', 'Artisanat', 'Métiers de l''artisanat et du savoir-faire'),
  ('batiment', 'Bâtiment', 'Construction, rénovation et travaux'),
  ('digital', 'Digital', 'Services numériques et technologiques'),
  ('sante', 'Santé & Bien-être', 'Services de santé et bien-être')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Catégories par secteur
-- =====================================================

-- Services
INSERT INTO public.pro_category (key, label, sector_key, description) VALUES 
  ('menage', 'Ménage et entretien', 'services', 'Nettoyage, ménage à domicile'),
  ('jardinage', 'Jardinage', 'services', 'Entretien espaces verts, jardinage'),
  ('garde-enfants', 'Garde d''enfants', 'services', 'Baby-sitting, garde d''enfants'),
  ('cours-soutien', 'Cours et soutien', 'services', 'Cours particuliers, soutien scolaire'),
  ('transport', 'Transport', 'services', 'Transport de personnes, livraison')
ON CONFLICT (key) DO NOTHING;

-- Artisanat
INSERT INTO public.pro_category (key, label, sector_key, description) VALUES 
  ('couture', 'Couture et retouches', 'artisanat', 'Couture, retouches, création textile'),
  ('menuiserie', 'Menuiserie', 'artisanat', 'Travail du bois, meubles sur mesure'),
  ('bijouterie', 'Bijouterie', 'artisanat', 'Création et réparation de bijoux'),
  ('poterie', 'Poterie et céramique', 'artisanat', 'Création d''objets en céramique'),
  ('maroquinerie', 'Maroquinerie', 'artisanat', 'Travail du cuir, sacs, accessoires')
ON CONFLICT (key) DO NOTHING;

-- Bâtiment
INSERT INTO public.pro_category (key, label, sector_key, description) VALUES 
  ('plomberie', 'Plomberie', 'batiment', 'Installation et réparation plomberie'),
  ('electricite', 'Électricité', 'batiment', 'Installation électrique, dépannage'),
  ('peinture', 'Peinture', 'batiment', 'Peinture intérieure et extérieure'),
  ('carrelage', 'Carrelage', 'batiment', 'Pose de carrelage, faïence'),
  ('serrurerie', 'Serrurerie', 'batiment', 'Serrures, métallerie, sécurité')
ON CONFLICT (key) DO NOTHING;

-- Digital
INSERT INTO public.pro_category (key, label, sector_key, description) VALUES 
  ('dev-web', 'Développement web', 'digital', 'Sites web, applications web'),
  ('design-graphique', 'Design graphique', 'digital', 'Logo, identité visuelle, print'),
  ('marketing-digital', 'Marketing digital', 'digital', 'SEO, réseaux sociaux, publicité'),
  ('redaction', 'Rédaction', 'digital', 'Rédaction web, contenu, copywriting'),
  ('photo-video', 'Photo et vidéo', 'digital', 'Photographie, montage vidéo')
ON CONFLICT (key) DO NOTHING;

-- Santé & Bien-être
INSERT INTO public.pro_category (key, label, sector_key, description) VALUES 
  ('massage', 'Massage et relaxation', 'sante', 'Massages thérapeutiques, relaxation'),
  ('coaching', 'Coaching personnel', 'sante', 'Coaching de vie, développement personnel'),
  ('fitness', 'Fitness et sport', 'sante', 'Coach sportif, préparation physique'),
  ('nutrition', 'Nutrition', 'sante', 'Conseils nutritionnels, diététique'),
  ('esthetique', 'Esthétique', 'sante', 'Soins esthétiques, beauté')
ON CONFLICT (key) DO NOTHING;

-- Ajouter un commentaire pour traçabilité
COMMENT ON TABLE public.pro_sector IS 'Secteurs d''activité avec données de base pour les tests';
COMMENT ON TABLE public.pro_category IS 'Catégories d''activité avec données de base pour les tests';
