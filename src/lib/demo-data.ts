import { Cours, Ecole, Module } from "@/types";

export interface DatabaseState {
  ecoles: Ecole[];
  courses: Cours[];
  modules: Module[];
}

export function getInitialDemoData(): DatabaseState {
  const ecoleAId = "11111111-1111-4111-8111-111111111111";
  const ecoleBId = "22222222-2222-4222-8222-222222222222";
  const ecoleCId = "33333333-3333-4333-8333-333333333333";

  const coursA1Id = "44444444-4444-4444-8444-444444444441";
  const coursA2DisorderId = "44444444-4444-4444-8444-444444444442";
  const coursB1Id = "55555555-5555-4555-8555-555555555551";
  const coursC1ExtendedId = "66666666-6666-4666-8666-666666666661";

  const now = new Date().toISOString();

  const ecoles: Ecole[] = [
    {
      id: ecoleAId,
      nom: "École Supérieure de Communication (École A)",
      statut: true,
      created_at: now,
    },
    {
      id: ecoleBId,
      nom: "Institut de Management & Business (École B)",
      statut: true,
      created_at: now,
    },
    {
      id: ecoleCId,
      nom: "Académie des Technologies & Numérique (École C)",
      statut: true,
      created_at: now,
    },
  ];

  const courses: Cours[] = [
    {
      id: coursA1Id,
      ecole_id: ecoleAId,
      nom_cours: "Stratégie de communication",
      thematique: "Marketing",
      description: "Apprentissage complet des bases de la communication corporate et digitale.",
      statut: "actif",
      created_at: now,
      updated_at: now,
    },
    {
      id: coursA2DisorderId,
      ecole_id: ecoleAId,
      nom_cours: "Transformation Digitale (Démo modules désordonnés)",
      thematique: "Innovation",
      description: "Ce cours démontre le tri automatique déterministe avec 4 modules insérés dans le désordre (4, 1, 3, 2).",
      statut: "actif",
      created_at: now,
      updated_at: now,
    },
    {
      id: coursB1Id,
      ecole_id: ecoleBId,
      nom_cours: "Management de projet",
      thematique: "Management",
      description: "Méthodologies agiles et traditionnelles pour piloter des projets d'envergure.",
      statut: "actif",
      created_at: now,
      updated_at: now,
    },
    {
      id: coursC1ExtendedId,
      ecole_id: ecoleCId,
      nom_cours: "Architecture Systèmes & Cloud",
      thematique: "Informatique",
      description: "Cours étendu démontrant le support de plus de 4 modules et le tri numérique strict (ex: module 10 après 5).",
      statut: "actif",
      created_at: now,
      updated_at: now,
    },
  ];

  // Note : pour coursA2DisorderId, l'ordre dans le tableau est volontairement [4, 1, 3, 2]
  // pour démontrer et tester que le tri déterministe remet 1, 2, 3, 4.
  const modules: Module[] = [
    // Cours École A1 : Stratégie de communication
    {
      id: "77777777-7777-4777-8777-777777777701",
      cours_id: coursA1Id,
      numero_module: 1,
      sous_titre: "Les fondamentaux",
      url_cours: "https://plateforme-cours.com/com/module-1-fondamentaux",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777702",
      cours_id: coursA1Id,
      numero_module: 2,
      sous_titre: "La stratégie de marque",
      url_cours: "https://plateforme-cours.com/com/module-2-strategie-marque",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777703",
      cours_id: coursA1Id,
      numero_module: 3,
      sous_titre: "Le plan de communication",
      url_cours: "https://plateforme-cours.com/com/module-3-plan-communication",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777704",
      cours_id: coursA1Id,
      numero_module: 4,
      sous_titre: "La mise en pratique",
      url_cours: "https://plateforme-cours.com/com/module-4-mise-en-pratique",
      created_at: now,
      updated_at: now,
    },

    // Cours École A2 (Inséré volontairement dans le désordre : 4, 1, 3, 2)
    {
      id: "77777777-7777-4777-8777-777777777705",
      cours_id: coursA2DisorderId,
      numero_module: 4,
      sous_titre: "Mesure d'impact et ROI numérique (Inséré en 1er)",
      url_cours: "https://plateforme-cours.com/transfo/module-4",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777706",
      cours_id: coursA2DisorderId,
      numero_module: 1,
      sous_titre: "Piliers et fondements du digital (Inséré en 2e)",
      url_cours: "https://plateforme-cours.com/transfo/module-1",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777707",
      cours_id: coursA2DisorderId,
      numero_module: 3,
      sous_titre: "Acculturation et conduite du changement (Inséré en 3e)",
      url_cours: "https://plateforme-cours.com/transfo/module-3",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777708",
      cours_id: coursA2DisorderId,
      numero_module: 2,
      sous_titre: "Écosystème technologique moderne (Inséré en 4e)",
      url_cours: "https://plateforme-cours.com/transfo/module-2",
      created_at: now,
      updated_at: now,
    },

    // Cours École B1 : Management de projet
    {
      id: "77777777-7777-4777-8777-777777777709",
      cours_id: coursB1Id,
      numero_module: 1,
      sous_titre: "Introduction",
      url_cours: "https://elearning-hub.fr/management/intro",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777710",
      cours_id: coursB1Id,
      numero_module: 2,
      sous_titre: "Pilotage",
      url_cours: "https://elearning-hub.fr/management/pilotage",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777711",
      cours_id: coursB1Id,
      numero_module: 3,
      sous_titre: "Évaluation",
      url_cours: "https://elearning-hub.fr/management/evaluation",
      created_at: now,
      updated_at: now,
    },

    // Cours École C1 : Démonstration variable et tri numérique (1, 2, 3, 5, 10)
    {
      id: "77777777-7777-4777-8777-777777777712",
      cours_id: coursC1ExtendedId,
      numero_module: 1,
      sous_titre: "Principes d'architecture distribuée",
      url_cours: "https://cloud-academy.org/sys/01",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777713",
      cours_id: coursC1ExtendedId,
      numero_module: 2,
      sous_titre: "Conteneurisation et Orchestration",
      url_cours: "https://cloud-academy.org/sys/02",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777714",
      cours_id: coursC1ExtendedId,
      numero_module: 3,
      sous_titre: "Infrastructure as Code",
      url_cours: "https://cloud-academy.org/sys/03",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777715",
      cours_id: coursC1ExtendedId,
      numero_module: 5,
      sous_titre: "Haute disponibilité et résilience",
      url_cours: "https://cloud-academy.org/sys/05",
      created_at: now,
      updated_at: now,
    },
    {
      id: "77777777-7777-4777-8777-777777777716",
      cours_id: coursC1ExtendedId,
      numero_module: 10,
      sous_titre: "Synthèse et soutenance finale (Module 10 après 5)",
      url_cours: "https://cloud-academy.org/sys/10",
      created_at: now,
      updated_at: now,
    },
  ];

  return { ecoles, courses, modules };
}
