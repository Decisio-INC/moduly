-- ==============================================================================
-- MODULY — SCHÉMA DE BASE DE DONNÉES COMPLET SUPABASE / POSTGRESQL
-- ==============================================================================
-- À exécuter directement dans le SQL Editor de votre projet Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Extensions cryptographiques pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE : ECOLES
-- Stocke les écoles ou universités partenaires
CREATE TABLE IF NOT EXISTS ecoles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    statut BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour recherche rapide et tri par nom d'école
CREATE INDEX IF NOT EXISTS idx_ecoles_nom ON ecoles (nom);

-- 3. TABLE : COURS
-- Stocke chaque formation/cours rattaché à une école spécifique
CREATE TABLE IF NOT EXISTS cours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ecole_id UUID NOT NULL REFERENCES ecoles(id) ON DELETE CASCADE,
    nom_cours TEXT NOT NULL,
    thematique TEXT NOT NULL DEFAULT 'Général',
    description TEXT,
    statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'archive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour les jointures et filtres
CREATE INDEX IF NOT EXISTS idx_cours_ecole_id ON cours (ecole_id);
CREATE INDEX IF NOT EXISTS idx_cours_nom ON cours (nom_cours);
CREATE INDEX IF NOT EXISTS idx_cours_thematique ON cours (thematique);

-- 4. TABLE : MODULES
-- Stocke les chapitres/modules rattachés à chaque cours avec leur URL externe
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cours_id UUID NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
    numero_module INTEGER NOT NULL CHECK (numero_module >= 1),
    sous_titre TEXT NOT NULL,
    url_cours TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Contrainte d'unicité centrale : un cours ne peut pas posséder deux modules de même numéro
    CONSTRAINT uq_cours_numero_module UNIQUE (cours_id, numero_module)
);

-- Index pour les jointures et le classement numérique déterministe
CREATE INDEX IF NOT EXISTS idx_modules_cours_id ON modules (cours_id);
CREATE INDEX IF NOT EXISTS idx_modules_cours_num ON modules (cours_id, numero_module ASC);

-- 5. TRIGGER DE MISE À JOUR AUTOMATIQUE (updated_at)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_cours ON cours;
CREATE TRIGGER set_timestamp_cours
BEFORE UPDATE ON cours
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_modules ON modules;
CREATE TRIGGER set_timestamp_modules
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ==============================================================================
-- 6. POLITIQUES ROW LEVEL SECURITY (RLS) : SELECT, INSERT, UPDATE, DELETE
-- ==============================================================================
-- Permet au front-office et au back-office d'effectuer toutes les opérations
-- CRUD avec la clé anon (ou service_role) sans blocage d'autorisation.

ALTER TABLE ecoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes politiques si existantes
DROP POLICY IF EXISTS "Accès complet ecoles" ON ecoles;
DROP POLICY IF EXISTS "Accès complet cours" ON cours;
DROP POLICY IF EXISTS "Accès complet modules" ON modules;
DROP POLICY IF EXISTS "Lecture publique ecoles" ON ecoles;
DROP POLICY IF EXISTS "Lecture publique cours" ON cours;
DROP POLICY IF EXISTS "Lecture publique modules" ON modules;

-- Politiques complètes pour ECOLES (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Accès complet ecoles"
ON ecoles
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Politiques complètes pour COURS (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Accès complet cours"
ON cours
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Politiques complètes pour MODULES (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Accès complet modules"
ON modules
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);
