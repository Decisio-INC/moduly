# MODULY — YOUR COURSES. ONE PLACE.

> **Plateforme personnelle SaaS haut de gamme pour centraliser, organiser et distribuer vos cours et modules dispersés sur différentes plateformes web.**

---

## 1. Présentation du Produit

**MODULY** répond à une problématique concrète rencontrée par les enseignants et intervenants : leurs cours sont souvent dispersés à travers plusieurs plateformes numériques (LMS d'écoles, plateformes tierces, Google Classroom, Notion, sites dédiés).

MODULY centralise tous ces liens dans une interface unique, moderne, ultra-épurée et responsive, avec un **moteur de classement déterministe** qui réorganise automatiquement les cours et modules sans intervention manuelle.

---

## 2. Direction Artistique & Charte Graphique

- **Fond principal :** Blanc pur `#FFFFFF`
- **Fond secondaire :** `#F7F8FA`
- **Texte principal :** `#171717`
- **Texte secondaire :** `#777777`
- **Couleur d'accent :** Bleu électrique `#4568F5` (survol : `#3654D9`)
- **Bordures :** Gris très clair (`#EAECEF`)
- **Typographie :** Geist / Inter
- **Composants :** Cartes blanches fines avec micro-ombres, boutons arrondis sobres et élégants.

---

## 3. Architecture Fonctionnelle

L'application est architecturée en deux espaces distincts :

### A. Front-Office (`/`)
- **Header minimaliste :** Logo MODULY, signature « YOUR COURSES. ONE PLACE. », barre de recherche instantanée (filtrage en temps réel par nom de cours, école, thématique ou sous-titre de module), filtres par école et thématique.
- **Corps principal :**
  - Section héro avec titre **MES COURS** et statistiques dynamiques.
  - Cours regroupés par **École** (triées par ordre alphabétique).
  - À l'intérieur de chaque école, cours triés **alphabétiquement**.
  - Cartes de cours élégantes affichant la thématique, le badge de l'école et le compteur de modules.
  - Liste ordonnée des modules au format `01 — Sous-titre` avec icône discrète d'ouverture externe (`target="_blank" rel="noopener noreferrer"`).
- **Footer :** Mentions légales `© 2026 MODULY` et lien discret d'accès à l'administration (`/admin`).

### B. Back-Office (`/admin`)
- Accessible directement sans formulaire ni mot de passe (conformément au cahier des charges).
- **Bannière d'alerte sécurité :** Rappel explicite que cette version de démonstration ne comporte pas d'authentification et ne doit pas être exposée publiquement sans protection d'accès.
- **Tableau de bord :** Statistiques en temps réel (Nombre d'écoles, cours, modules, cours archivés).
- **Bouton d'action rapide :** `+ AJOUTER UN MODULE` :
  - Sélection ou création automatique de l'école.
  - Sélection ou création automatique du cours (avec reprise de la thématique).
  - Validation du numéro entier de module (ex: 1, 2, 3, 10).
  - Sous-titre et lien URL.
  - **Détection de conflit en temps réel :** Alerte en cas de numéro déjà existant dans le cours, avec boutons « Remplacer le module existant » ou « Changer de numéro (+1) ».
- **Gestion des contenus :**
  - Modification des cours (nom, thématique, description, statut actif/archivé).
  - Modification des modules (numéro, sous-titre, URL).
  - Duplication de module en 1 clic (calcule automatiquement le prochain numéro disponible).
  - Suppression sécurisée de cours et modules avec boîte de dialogue de confirmation.
  - Bouton de réinitialisation des données de démonstration officielles.

---

## 4. Le Moteur Automatique de Classement

Le moteur de classement est **strictement déterministe** (aucune IA générative n'est utilisée pour le tri) :

1. **Règle 1 (Identification) :** Un cours est identifié de façon unique par son identifiant et son école. Deux écoles différentes peuvent posséder un cours du même nom sans aucune interférence.
2. **Règle 2 (Rattachement) :** Chaque module est rattaché à son cours parent avec intégrité référentielle en cascade.
3. **Règle 3 (Tri numérique strict) :** Les modules sont triés par `numero_module ASC` de manière numérique (`a - b`), garantissant que le module 10 apparaisse impérativement après le module 5 (et non avant comme dans un tri alphabétique).
4. **Règle 4 (Ajout désordonné) :** Des modules insérés dans l'ordre `4, 1, 3, 2` sont automatiquement restitués dans l'ordre `01, 02, 03, 04`.
5. **Règle 5 (Nombre variable) :** Aucun module vide n'est créé artificiellement. Les cours supportent 1, 2, 4, 10 ou davantage de modules.
6. **Règle 6 (Unicité) :** Contrainte d'unicité sur `(cours_id, numero_module)` avec gestion des conflits et proposition de remplacement.

---

## 5. Structure de la Base de Données

### Schéma PostgreSQL / Supabase (`supabase/schema.sql`)

```sql
-- ECOLES
CREATE TABLE ecoles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    statut BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- COURS
CREATE TABLE cours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ecole_id UUID NOT NULL REFERENCES ecoles(id) ON DELETE CASCADE,
    nom_cours TEXT NOT NULL,
    thematique TEXT NOT NULL,
    description TEXT,
    statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'archive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MODULES
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cours_id UUID NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
    numero_module INTEGER NOT NULL CHECK (numero_module >= 1),
    sous_titre TEXT NOT NULL,
    url_cours TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_cours_numero_module UNIQUE (cours_id, numero_module)
);
```

### Double Mode de Persistance
- **Mode Local par défaut :** Stockage atomique persistant dans `data/moduly-store.json`. Fonctionne immédiatement sans aucun compte externe ni clé d'API.
- **Mode Supabase distant :** Renseignez `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` pour vous connecter à votre instance PostgreSQL Supabase hébergée.

---

## 6. Lancement et Utilisation

### Prérequis
- Node.js version 18+ (testé avec Node v24).

### Démarrage en Développement
```bash
# Se placer dans le dossier du projet
cd moduly

# Lancer le serveur de développement
npm run dev
```
Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Exécution de la Suite de Tests Officielle
Pour valider l'ensemble des 12 tests fonctionnels et contraintes de sécurité :
```bash
npm test
```

### Build de Production
```bash
npm run build
npm start
```

---

## 7. Déploiement sur Vercel & Supabase

1. **Base de données Supabase :**
   - Créez un projet gratuit sur [Supabase](https://supabase.com).
   - Rendez-vous dans le **SQL Editor** et collez le contenu du fichier `supabase/schema.sql`.
   - Récupérez l'URL du projet et la `service_role key` dans **Settings > API**.

2. **Déploiement Vercel :**
   - Importez le dépôt dans votre compte Vercel.
   - Ajoutez les variables d'environnement dans l'interface Vercel :
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (privée, côté serveur)
   - Lancez le déploiement.

---

## 8. Note Importante de Sécurité

Dans cette version, l'accès au back-office `/admin` a été expressément conçu sans système d'authentification pour maximiser la simplicité d'utilisation. Si vous prévoyez d'ouvrir ce service sur un domaine public, nous recommandons de :
1. Restreindre l'accès par mot de passe ou authentification (ex: NextAuth, Supabase Auth ou HTTP Basic Auth).
2. Ne jamais exposer la variable `SUPABASE_SERVICE_ROLE_KEY` dans les fichiers clients.
