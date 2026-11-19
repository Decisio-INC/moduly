import { Cours, Ecole, Module, CoursWithDetails, EcoleWithCourses } from "@/types";

/**
 * MOTEUR AUTOMATIQUE DE CLASSEMENT (DÉTERMINISTE ET NON GÉNÉRATIF)
 * 
 * Règle 1 : Un cours est identifié par son école et son identifiant unique. Deux cours de deux écoles différentes
 *           peuvent porter le même nom sans collision.
 * Règle 2 : Rattachement direct de chaque module à son cours parent.
 * Règle 3 : Véritable tri numérique sur numero_module (a.numero_module - b.numero_module), JAMAIS alphabétique.
 *           Exemple : 1, 2, 3, 4, 5, 10 (et non 1, 10, 2...)
 * Règle 4 : Tri automatique instantané quel que soit l'ordre d'insertion (ex : 4, 1, 3, 2 -> 1, 2, 3, 4).
 * Règle 5 : Nombre variable de modules. Aucun module vide créé artificiellement.
 * Règle 6 : Contrainte d'unicité cours_id + numero_module.
 */

/**
 * Trie une liste de modules de manière strictement numérique.
 */
export function sortModulesNumeric(modules: Module[]): Module[] {
  return [...modules].sort((a, b) => {
    const numA = Number(a.numero_module);
    const numB = Number(b.numero_module);
    return numA - numB;
  });
}

/**
 * Trie une liste de cours par ordre alphabétique de leur nom.
 */
export function sortCoursesAlphabetical(courses: CoursWithDetails[]): CoursWithDetails[] {
  return [...courses].sort((a, b) => {
    return a.nom_cours.localeCompare(b.nom_cours, "fr", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

/**
 * Trie une liste d'écoles par ordre alphabétique.
 */
export function sortEcolesAlphabetical<T extends { nom: string }>(ecoles: T[]): T[] {
  return [...ecoles].sort((a, b) => {
    return a.nom.localeCompare(b.nom, "fr", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

/**
 * Moteur d'agrégation et de classement complet :
 * Associe les modules à leurs cours, les cours à leurs écoles, et applique les tris déterministes.
 */
export function buildSortedCatalog(
  ecoles: Ecole[],
  courses: Cours[],
  modules: Module[],
  filterArchived: boolean = true
): EcoleWithCourses[] {
  // 1. Filtrer les cours archivés si demandé (pour le front-office)
  const activeCourses = filterArchived
    ? courses.filter((c) => c.statut !== "archive")
    : courses;

  // 2. Associer les modules à chaque cours et trier numériquement
  const coursesWithModules: CoursWithDetails[] = activeCourses.map((course) => {
    const courseModules = modules.filter((m) => m.cours_id === course.id);
    const sortedModules = sortModulesNumeric(courseModules);
    const parentEcole = ecoles.find((e) => e.id === course.ecole_id);

    return {
      ...course,
      ecole: parentEcole,
      modules: sortedModules,
    };
  });

  // 3. Regrouper par école
  const schoolsMap = new Map<string, EcoleWithCourses>();

  ecoles.forEach((ecole) => {
    schoolsMap.set(ecole.id, {
      ...ecole,
      courses: [],
    });
  });

  coursesWithModules.forEach((course) => {
    const ecoleGroup = schoolsMap.get(course.ecole_id);
    if (ecoleGroup) {
      ecoleGroup.courses.push(course);
    }
  });

  // 4. Trier chaque groupe de cours par ordre alphabétique
  const groupedResult: EcoleWithCourses[] = [];
  schoolsMap.forEach((ecoleGroup) => {
    ecoleGroup.courses = sortCoursesAlphabetical(ecoleGroup.courses);
    groupedResult.push(ecoleGroup);
  });

  // 5. Trier les écoles par ordre alphabétique
  return sortEcolesAlphabetical(groupedResult);
}
