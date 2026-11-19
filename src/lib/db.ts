import {
  Ecole,
  Cours,
  Module,
  CreateModulePayload,
  UpdateModulePayload,
  UpdateCoursPayload,
  UpdateEcolePayload,
  CatalogStats,
  EcoleWithCourses,
} from "@/types";
import { getInitialDemoData, DatabaseState } from "./demo-data";
import { buildSortedCatalog } from "./sorting";
import { getSupabase } from "./supabase";

/**
 * Récupère l'état brut de la base de données directement depuis Supabase.
 * AUCUN stockage local, AUCUN fallback vers des données en mémoire ou démo.
 * En cas d'erreur Supabase, l'erreur exacte est levée.
 */
export async function getRawData(): Promise<DatabaseState> {
  const supabase = getSupabase();

  const [ecolesRes, coursesRes, modulesRes] = await Promise.all([
    supabase.from("ecoles").select("*"),
    supabase.from("cours").select("*"),
    supabase.from("modules").select("*"),
  ]);

  if (ecolesRes.error) {
    throw new Error(`Erreur Supabase (table ecoles): ${ecolesRes.error.message} (code: ${ecolesRes.error.code})`);
  }
  if (coursesRes.error) {
    throw new Error(`Erreur Supabase (table cours): ${coursesRes.error.message} (code: ${coursesRes.error.code})`);
  }
  if (modulesRes.error) {
    throw new Error(`Erreur Supabase (table modules): ${modulesRes.error.message} (code: ${modulesRes.error.code})`);
  }

  return {
    ecoles: (ecolesRes.data || []) as Ecole[],
    courses: (coursesRes.data || []) as Cours[],
    modules: (modulesRes.data || []) as Module[],
  };
}

/**
 * Récupère le catalogue trié selon les règles déterministes.
 */
export async function getCatalog(filterArchived: boolean = true): Promise<EcoleWithCourses[]> {
  const data = await getRawData();
  return buildSortedCatalog(data.ecoles, data.courses, data.modules, filterArchived);
}

/**
 * Récupère les statistiques de la plateforme en temps réel depuis Supabase.
 */
export async function getStats(): Promise<CatalogStats> {
  const data = await getRawData();
  const totalEcoles = data.ecoles.length;
  const totalCours = data.courses.length;
  const totalModules = data.modules.length;
  const totalArchives = data.courses.filter((c) => c.statut === "archive").length;

  return {
    totalEcoles,
    totalCours,
    totalModules,
    totalArchives,
  };
}

/**
 * Création d'un module avec résolution/création d'école et de cours dans Supabase,
 * et respect strict de la contrainte d'unicité (cours_id + numero_module).
 */
export async function createModule(payload: CreateModulePayload): Promise<{
  success: boolean;
  module?: Module;
  cours?: Cours;
  ecole?: Ecole;
  replaced?: boolean;
  conflict?: {
    cours_id: string;
    numero_module: number;
    existing_module: Module;
    cours_nom: string;
    ecole_nom: string;
  };
  error?: string;
}> {
  const supabase = getSupabase();

  const ecoleNom = payload.ecole_nom.trim();
  const coursNom = payload.nom_cours.trim();
  const thematique = payload.thematique.trim();
  const numeroModule = parseInt(String(payload.numero_module), 10);
  const sousTitre = payload.sous_titre.trim();
  const urlCours = payload.url_cours.trim();

  if (!ecoleNom) return { success: false, error: "Le nom de l'école est obligatoire." };
  if (!coursNom) return { success: false, error: "Le nom du cours est obligatoire." };
  if (isNaN(numeroModule) || numeroModule < 1) {
    return { success: false, error: "Le numéro de module doit être un entier positif supérieur ou égal à 1." };
  }
  if (!sousTitre) return { success: false, error: "Le sous-titre du module est obligatoire." };
  if (!urlCours) return { success: false, error: "L'URL du cours est obligatoire." };

  const now = new Date().toISOString();

  try {
    // 1. Trouver ou créer l'école dans Supabase
    let ecole: Ecole;
    const { data: existingEcoles, error: ecoleFindErr } = await supabase
      .from("ecoles")
      .select("*")
      .ilike("nom", ecoleNom)
      .limit(1);

    if (ecoleFindErr) throw new Error(`Erreur recherche école: ${ecoleFindErr.message}`);

    if (existingEcoles && existingEcoles.length > 0) {
      ecole = existingEcoles[0] as Ecole;
    } else {
      const { data: newEcole, error: ecoleErr } = await supabase
        .from("ecoles")
        .insert({ nom: ecoleNom, statut: true })
        .select()
        .single();
      if (ecoleErr) throw new Error(`Erreur création école: ${ecoleErr.message}`);
      ecole = newEcole as Ecole;
    }

    // 2. Trouver ou créer le cours rattaché à cette école
    let cours: Cours;
    const { data: existingCours, error: coursFindErr } = await supabase
      .from("cours")
      .select("*")
      .eq("ecole_id", ecole.id)
      .ilike("nom_cours", coursNom)
      .limit(1);

    if (coursFindErr) throw new Error(`Erreur recherche cours: ${coursFindErr.message}`);

    if (existingCours && existingCours.length > 0) {
      cours = existingCours[0] as Cours;
    } else {
      const { data: newCours, error: coursErr } = await supabase
        .from("cours")
        .insert({
          ecole_id: ecole.id,
          nom_cours: coursNom,
          thematique: thematique || "Général",
          statut: "actif",
        })
        .select()
        .single();
      if (coursErr) throw new Error(`Erreur création cours: ${coursErr.message}`);
      cours = newCours as Cours;
    }

    // 3. Vérifier le doublon sur cours_id + numero_module
    const { data: existingModule, error: modFindErr } = await supabase
      .from("modules")
      .select("*")
      .eq("cours_id", cours.id)
      .eq("numero_module", numeroModule)
      .maybeSingle();

    if (modFindErr) throw new Error(`Erreur vérification doublon module: ${modFindErr.message}`);

    if (existingModule) {
      if (!payload.replace_if_exists) {
        return {
          success: false,
          conflict: {
            cours_id: cours.id,
            numero_module: numeroModule,
            existing_module: existingModule as Module,
            cours_nom: coursNom,
            ecole_nom: ecoleNom,
          },
          error: `Le module ${numeroModule} existe déjà pour ce cours (${existingModule.sous_titre}).`,
        };
      } else {
        // Remplacer le module existant dans Supabase
        const { data: updatedModule, error: updateErr } = await supabase
          .from("modules")
          .update({
            sous_titre: sousTitre,
            url_cours: urlCours,
            updated_at: now,
          })
          .eq("id", existingModule.id)
          .select()
          .single();

        if (updateErr) throw new Error(`Erreur mise à jour module: ${updateErr.message}`);

        return {
          success: true,
          replaced: true,
          module: updatedModule as Module,
          cours,
          ecole,
        };
      }
    }

    // 4. Insérer le nouveau module dans Supabase
    const { data: createdModule, error: modErr } = await supabase
      .from("modules")
      .insert({
        cours_id: cours.id,
        numero_module: numeroModule,
        sous_titre: sousTitre,
        url_cours: urlCours,
      })
      .select()
      .single();

    if (modErr) throw new Error(`Erreur insertion module: ${modErr.message}`);

    return {
      success: true,
      module: createdModule as Module,
      cours,
      ecole,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inattendue Supabase";
    console.error("createModule error:", message);
    return { success: false, error: message };
  }
}

/**
 * Modification d'une école dans Supabase.
 */
export async function updateEcole(
  id: string,
  payload: UpdateEcolePayload
): Promise<{ success: boolean; ecole?: Ecole; error?: string }> {
  const supabase = getSupabase();

  try {
    const updates: Record<string, unknown> = {};
    if (payload.nom !== undefined) updates.nom = payload.nom.trim();
    if (payload.statut !== undefined) updates.statut = payload.statut;

    const { data: updated, error } = await supabase
      .from("ecoles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, ecole: updated as Ecole };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur mise à jour école";
    console.error("updateEcole error:", message);
    return { success: false, error: message };
  }
}

/**
 * Suppression d'une école dans Supabase (cascade automatique sur les cours et modules).
 */
export async function deleteEcole(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase.from("ecoles").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression école";
    console.error("deleteEcole error:", message);
    return { success: false, error: message };
  }
}

/**
 * Modification d'un cours dans Supabase.
 */
export async function updateCourse(
  id: string,
  payload: UpdateCoursPayload
): Promise<{ success: boolean; cours?: Cours; error?: string }> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  try {
    const updates: Record<string, unknown> = { updated_at: now };
    if (payload.nom_cours !== undefined) updates.nom_cours = payload.nom_cours.trim();
    if (payload.thematique !== undefined) updates.thematique = payload.thematique.trim();
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.statut !== undefined) updates.statut = payload.statut;

    const { data: updated, error } = await supabase
      .from("cours")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, cours: updated as Cours };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur mise à jour cours";
    console.error("updateCourse error:", message);
    return { success: false, error: message };
  }
}

/**
 * Suppression d'un cours dans Supabase (cascade automatique sur ses modules).
 */
export async function deleteCourse(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase.from("cours").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression cours";
    console.error("deleteCourse error:", message);
    return { success: false, error: message };
  }
}

/**
 * Mise à jour d'un module dans Supabase.
 */
export async function updateModule(
  id: string,
  payload: UpdateModulePayload
): Promise<{
  success: boolean;
  module?: Module;
  error?: string;
  conflict?: boolean;
}> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  try {
    const { data: currentMod, error: getErr } = await supabase
      .from("modules")
      .select("*")
      .eq("id", id)
      .single();

    if (getErr || !currentMod) throw new Error("Module introuvable dans Supabase.");

    const newNum = payload.numero_module !== undefined ? Number(payload.numero_module) : currentMod.numero_module;

    // Si le numéro a changé, vérifier la collision au sein du même cours
    if (newNum !== currentMod.numero_module) {
      const { data: duplicate } = await supabase
        .from("modules")
        .select("*")
        .eq("cours_id", currentMod.cours_id)
        .eq("numero_module", newNum)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        if (!payload.replace_if_exists) {
          return {
            success: false,
            conflict: true,
            error: `Le module numéro ${newNum} existe déjà dans ce cours (${duplicate.sous_titre}).`,
          };
        } else {
          await supabase.from("modules").delete().eq("id", duplicate.id);
        }
      }
    }

    const updates: Record<string, unknown> = {
      numero_module: newNum,
      updated_at: now,
    };
    if (payload.sous_titre !== undefined) updates.sous_titre = payload.sous_titre.trim();
    if (payload.url_cours !== undefined) updates.url_cours = payload.url_cours.trim();

    const { data: updated, error: updateErr } = await supabase
      .from("modules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);
    return { success: true, module: updated as Module };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur mise à jour module";
    console.error("updateModule error:", message);
    return { success: false, error: message };
  }
}

/**
 * Suppression d'un module dans Supabase.
 */
export async function deleteModule(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur suppression module";
    console.error("deleteModule error:", message);
    return { success: false, error: message };
  }
}

/**
 * Duplication d'un module dans Supabase avec calcul du prochain numéro disponible.
 */
export async function duplicateModule(id: string): Promise<{
  success: boolean;
  module?: Module;
  error?: string;
}> {
  const supabase = getSupabase();

  try {
    const { data: source, error: srcErr } = await supabase
      .from("modules")
      .select("*")
      .eq("id", id)
      .single();

    if (srcErr || !source) throw new Error("Module source introuvable.");

    const { data: allMods, error: listErr } = await supabase
      .from("modules")
      .select("numero_module")
      .eq("cours_id", source.cours_id);

    if (listErr) throw new Error(listErr.message);

    const takenNumbers = new Set((allMods || []).map((m) => m.numero_module));
    let nextNum = source.numero_module + 1;
    while (takenNumbers.has(nextNum)) {
      nextNum++;
    }

    const { data: duplicated, error: insertErr } = await supabase
      .from("modules")
      .insert({
        cours_id: source.cours_id,
        numero_module: nextNum,
        sous_titre: `${source.sous_titre} (Copie)`,
        url_cours: source.url_cours,
      })
      .select()
      .single();

    if (insertErr) throw new Error(insertErr.message);
    return { success: true, module: duplicated as Module };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur duplication module";
    console.error("duplicateModule error:", message);
    return { success: false, error: message };
  }
}

/**
 * Réinitialisation aux données de démonstration dans Supabase (action manuelle utilisateur).
 */
export async function resetDemoData(): Promise<DatabaseState> {
  const supabase = getSupabase();
  const freshDemo = getInitialDemoData();

  // Vider les tables existantes dans Supabase
  await supabase.from("modules").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("cours").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("ecoles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Insérer les écoles
  const { error: errE } = await supabase.from("ecoles").insert(
    freshDemo.ecoles.map((e) => ({
      id: e.id,
      nom: e.nom,
      statut: e.statut,
    }))
  );
  if (errE) throw new Error(`Erreur réinitialisation écoles: ${errE.message}`);

  // Insérer les cours
  const { error: errC } = await supabase.from("cours").insert(
    freshDemo.courses.map((c) => ({
      id: c.id,
      ecole_id: c.ecole_id,
      nom_cours: c.nom_cours,
      thematique: c.thematique,
      description: c.description,
      statut: c.statut,
    }))
  );
  if (errC) throw new Error(`Erreur réinitialisation cours: ${errC.message}`);

  // Insérer les modules
  const { error: errM } = await supabase.from("modules").insert(
    freshDemo.modules.map((m) => ({
      id: m.id,
      cours_id: m.cours_id,
      numero_module: m.numero_module,
      sous_titre: m.sous_titre,
      url_cours: m.url_cours,
    }))
  );
  if (errM) throw new Error(`Erreur réinitialisation modules: ${errM.message}`);

  return freshDemo;
}
