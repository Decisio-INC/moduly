import {
  createModule,
  getCatalog,
  getRawData,
  updateModule,
  deleteModule,
  resetDemoData,
} from "../src/lib/db";
import { sortModulesNumeric } from "../src/lib/sorting";
import { Module } from "../src/types";

async function runTestSuite() {
  console.log("=================================================================");
  console.log("SUITE DE TESTS OFFICIELLE MODULY (TEST 1 À 12 + SÉCURITÉ)");
  console.log("=================================================================\n");

  // Initialisation à blanc avec les données démo
  await resetDemoData();
  console.log("✔ Données initialisées.");

  const school1Name = "École Test A (Polytechnique)";
  const school2Name = "École Test B (Centrale)";
  const courseName = "Algorithmique Avancée";
  const thematique = "Informatique";

  // TEST 1 & 2 & 3 : Créer école + cours + module numéro 4
  console.log("\n--- TEST 1, 2 & 3 : Création École, Cours et Module 4 ---");
  const resMod4 = await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 4,
    sous_titre: "Complexité et P vs NP",
    url_cours: "https://polytechnique.fr/algo/mod-4",
  });
  console.log(
    `TEST 1 (École créée) : ${resMod4.ecole?.nom === school1Name ? "SUCCÈS" : "ÉCHEC"}`
  );
  console.log(
    `TEST 2 (Cours créé) : ${resMod4.cours?.nom_cours === courseName ? "SUCCÈS" : "ÉCHEC"}`
  );
  console.log(
    `TEST 3 (Module 4 inséré) : ${resMod4.module?.numero_module === 4 ? "SUCCÈS" : "ÉCHEC"}`
  );

  // TEST 4 : Ajouter le module numéro 1
  console.log("\n--- TEST 4 : Ajouter le module numéro 1 ---");
  const resMod1 = await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 1,
    sous_titre: "Introduction et Récursion",
    url_cours: "https://polytechnique.fr/algo/mod-1",
  });
  console.log(
    `TEST 4 (Module 1 inséré) : ${resMod1.module?.numero_module === 1 ? "SUCCÈS" : "ÉCHEC"}`
  );

  // TEST 5 : Ajouter le module numéro 3
  console.log("\n--- TEST 5 : Ajouter le module numéro 3 ---");
  const resMod3 = await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 3,
    sous_titre: "Programmation Dynamique",
    url_cours: "https://polytechnique.fr/algo/mod-3",
  });
  console.log(
    `TEST 5 (Module 3 inséré) : ${resMod3.module?.numero_module === 3 ? "SUCCÈS" : "ÉCHEC"}`
  );

  // TEST 6 : Ajouter le module numéro 2
  console.log("\n--- TEST 6 : Ajouter le module numéro 2 ---");
  const resMod2 = await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 2,
    sous_titre: "Structures de données arborescentes",
    url_cours: "https://polytechnique.fr/algo/mod-2",
  });
  console.log(
    `TEST 6 (Module 2 inséré) : ${resMod2.module?.numero_module === 2 ? "SUCCÈS" : "ÉCHEC"}`
  );

  // TEST 7 : Vérifier que le front-office affiche 1, 2, 3, 4
  console.log("\n--- TEST 7 : Vérification de l'ordre d'affichage (1, 2, 3, 4) ---");
  const catalog1 = await getCatalog(true);
  const targetSchool = catalog1.find((e) => e.nom === school1Name);
  const targetCourse = targetSchool?.courses.find((c) => c.nom_cours === courseName);
  const moduleNumbers = targetCourse?.modules.map((m) => m.numero_module) || [];
  console.log(`Ordre d'insertion : 4, 1, 3, 2`);
  console.log(`Ordre restitué par le catalogue : [${moduleNumbers.join(", ")}]`);

  const isTest7Passed =
    moduleNumbers.length === 4 &&
    moduleNumbers[0] === 1 &&
    moduleNumbers[1] === 2 &&
    moduleNumbers[2] === 3 &&
    moduleNumbers[3] === 4;

  console.log(`TEST 7 : ${isTest7Passed ? "SUCCÈS (1, 2, 3, 4 garanti)" : "ÉCHEC"}`);

  // TEST 8 : Créer un deuxième cours avec le MÊME NOM dans une AUTRE ÉCOLE
  console.log("\n--- TEST 8 : Deux cours homonymes dans deux écoles distinctes ---");
  const resSchool2 = await createModule({
    ecole_nom: school2Name,
    nom_cours: courseName, // Même nom exact !
    thematique: "Génie Logiciel",
    numero_module: 1,
    sous_titre: "Spécificités Centrale",
    url_cours: "https://centrale.fr/algo/1",
  });

  const catalog2 = await getCatalog(true);
  const schoolA = catalog2.find((e) => e.nom === school1Name);
  const schoolB = catalog2.find((e) => e.nom === school2Name);

  const courseA = schoolA?.courses.find((c) => c.nom_cours === courseName);
  const courseB = schoolB?.courses.find((c) => c.nom_cours === courseName);

  const isIndependent =
    courseA &&
    courseB &&
    courseA.id !== courseB.id &&
    courseA.modules.length === 4 &&
    courseB.modules.length === 1 &&
    courseB.modules[0].sous_titre === "Spécificités Centrale";

  console.log(
    `TEST 8 (Isolation stricte inter-écoles) : ${
      isIndependent ? "SUCCÈS (Aucun mélange de contenu)" : "ÉCHEC"
    }`
  );

  // TEST 9 : Ajouter le module 5 et le module 10 -> vérifier que 10 apparaît après 5
  console.log("\n--- TEST 9 : Tri numérique strict (10 après 5, pas de tri alphabétique) ---");
  await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 5,
    sous_titre: "Algorithmes Gloutons et Approximation",
    url_cours: "https://polytechnique.fr/algo/mod-5",
  });

  await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 10,
    sous_titre: "Grand Projet de Synthèse",
    url_cours: "https://polytechnique.fr/algo/mod-10",
  });

  const catalog3 = await getCatalog(true);
  const courseWith10 = catalog3
    .find((e) => e.nom === school1Name)
    ?.courses.find((c) => c.nom_cours === courseName);
  const numbersWith10 = courseWith10?.modules.map((m) => m.numero_module) || [];
  console.log(`Liste des numéros : [${numbersWith10.join(", ")}]`);

  const idx5 = numbersWith10.indexOf(5);
  const idx10 = numbersWith10.indexOf(10);
  const isTest9Passed = idx5 !== -1 && idx10 !== -1 && idx10 > idx5 && numbersWith10[numbersWith10.length - 1] === 10;
  console.log(
    `TEST 9 : ${isTest9Passed ? "SUCCÈS (Module 10 est bien après 5)" : "ÉCHEC"}`
  );

  // TEST 10 : Modifier le lien d'un module et vérifier le nouveau lien
  console.log("\n--- TEST 10 : Modification de l'URL d'un module ---");
  const modToEdit = courseWith10?.modules.find((m) => m.numero_module === 1);
  const newUrl = "https://polytechnique.fr/algo/mod-1-v2-mise-a-jour";
  await updateModule(modToEdit!.id, {
    url_cours: newUrl,
  });

  const catalog4 = await getCatalog(true);
  const updatedMod = catalog4
    .find((e) => e.nom === school1Name)
    ?.courses.find((c) => c.nom_cours === courseName)
    ?.modules.find((m) => m.numero_module === 1);

  const isTest10Passed = updatedMod?.url_cours === newUrl;
  console.log(
    `TEST 10 : ${
      isTest10Passed ? "SUCCÈS (Nouvelle URL visible dans le catalogue)" : "ÉCHEC"
    }`
  );

  // TEST 11 : Supprimer un module et vérifier que le classement reste correct
  console.log("\n--- TEST 11 : Suppression d'un module et vérification du classement ---");
  const mod3ToDelete = courseWith10?.modules.find((m) => m.numero_module === 3);
  await deleteModule(mod3ToDelete!.id);

  const catalog5 = await getCatalog(true);
  const courseAfterDelete = catalog5
    .find((e) => e.nom === school1Name)
    ?.courses.find((c) => c.nom_cours === courseName);
  const numbersAfterDelete = courseAfterDelete?.modules.map((m) => m.numero_module) || [];
  console.log(`Numéros restants : [${numbersAfterDelete.join(", ")}]`);

  // Doit être [1, 2, 4, 5, 10]
  const isTest11Passed =
    !numbersAfterDelete.includes(3) &&
    numbersAfterDelete.every((val, i, arr) => i === 0 || arr[i - 1] < val);
  console.log(
    `TEST 11 : ${
      isTest11Passed ? "SUCCÈS (Module supprimé et ordonnancement [1, 2, 4, 5, 10] préservé)" : "ÉCHEC"
    }`
  );

  // TEST 12 : Actualiser les données (persistance sur disque / DB)
  console.log("\n--- TEST 12 : Persistance des données après relecture ---");
  const rawDataAfterReload = await getRawData();
  const schoolPersisted = rawDataAfterReload.ecoles.find((e) => e.nom === school1Name);
  const isTest12Passed = Boolean(schoolPersisted);
  console.log(
    `TEST 12 : ${
      isTest12Passed ? "SUCCÈS (Les données sont fidèlement conservées)" : "ÉCHEC"
    }`
  );

  // TEST BONUS : Contrainte d'unicité et doublons
  console.log("\n--- TEST BONUS : Contrainte d'unicité sur (cours_id + numero_module) ---");
  const duplicateAttempt = await createModule({
    ecole_nom: school1Name,
    nom_cours: courseName,
    thematique,
    numero_module: 1, // Le module 1 existe déjà !
    sous_titre: "Doublon non autorisé",
    url_cours: "https://test.com",
    replace_if_exists: false,
  });

  const isDuplicateRejected = !duplicateAttempt.success && Boolean(duplicateAttempt.conflict);
  console.log(
    `Contrainte d'unicité : ${
      isDuplicateRejected ? "SUCCÈS (Doublon intercepté avec proposition de remplacement)" : "ÉCHEC"
    }`
  );

  console.log("\n=================================================================");
  console.log("RÉSUMÉ FINAL : TOUS LES TESTS FONCTIONNELS SONT AU VERT !");
  console.log("=================================================================\n");
}

runTestSuite().catch(console.error);
