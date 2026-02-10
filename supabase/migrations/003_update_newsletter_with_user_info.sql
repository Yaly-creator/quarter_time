-- Migration: Enrichir la table newsletter_subscribers avec les infos utilisateur
-- Si l'email de l'abonné correspond à un utilisateur auth, on récupère ses infos

-- 1. Ajouter les colonnes pour les infos utilisateur
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS prenom TEXT,
  ADD COLUMN IF NOT EXISTS nom TEXT,
  ADD COLUMN IF NOT EXISTS telephone TEXT,
  ADD COLUMN IF NOT EXISTS adresse TEXT,
  ADD COLUMN IF NOT EXISTS code_postal TEXT,
  ADD COLUMN IF NOT EXISTS ville TEXT;

-- 2. Créer la fonction trigger qui enrichit automatiquement depuis auth.users
CREATE OR REPLACE FUNCTION enrich_newsletter_from_auth()
RETURNS TRIGGER AS $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Chercher l'utilisateur dans auth.users par email
  SELECT id, email, raw_user_meta_data
  INTO auth_user
  FROM auth.users
  WHERE email = NEW.email
  LIMIT 1;

  -- Si un utilisateur auth est trouvé, remplir les champs
  IF FOUND THEN
    NEW.user_id := COALESCE(NEW.user_id, auth_user.id);
    NEW.user_email := COALESCE(NEW.user_email, auth_user.email);
    NEW.prenom := COALESCE(NEW.prenom, auth_user.raw_user_meta_data->>'prenom');
    NEW.nom := COALESCE(NEW.nom, auth_user.raw_user_meta_data->>'nom');
    NEW.telephone := COALESCE(NEW.telephone, auth_user.raw_user_meta_data->>'telephone');
    NEW.adresse := COALESCE(NEW.adresse, auth_user.raw_user_meta_data->>'adresse');
    NEW.code_postal := COALESCE(NEW.code_postal, auth_user.raw_user_meta_data->>'code_postal');
    NEW.ville := COALESCE(NEW.ville, auth_user.raw_user_meta_data->>'ville');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_enrich_newsletter ON newsletter_subscribers;
CREATE TRIGGER trigger_enrich_newsletter
  BEFORE INSERT ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION enrich_newsletter_from_auth();

-- 4. Mettre à jour les abonnés existants qui ont un email correspondant dans auth.users
UPDATE newsletter_subscribers ns
SET
  user_id = COALESCE(ns.user_id, au.id),
  user_email = COALESCE(ns.user_email, au.email),
  prenom = COALESCE(ns.prenom, au.raw_user_meta_data->>'prenom'),
  nom = COALESCE(ns.nom, au.raw_user_meta_data->>'nom'),
  telephone = COALESCE(ns.telephone, au.raw_user_meta_data->>'telephone'),
  adresse = COALESCE(ns.adresse, au.raw_user_meta_data->>'adresse'),
  code_postal = COALESCE(ns.code_postal, au.raw_user_meta_data->>'code_postal'),
  ville = COALESCE(ns.ville, au.raw_user_meta_data->>'ville')
FROM auth.users au
WHERE au.email = ns.email
  AND (ns.prenom IS NULL OR ns.nom IS NULL);
