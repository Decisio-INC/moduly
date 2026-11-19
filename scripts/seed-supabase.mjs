import { createClient } from "@supabase/supabase-js";
import { getInitialDemoData } from "./src/lib/demo-data.js";

const url = "https://emhqremyuckdojwtseok.supabase.co";
const key = "sb_secret_MMioglL8wm5UONvZ65LYqw_6mHhEGax";

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("Seeding Supabase database...");
  const demo = getInitialDemoData();

  // 1. Insert Ecoles
  const { data: ecoles, error: errE } = await supabase.from("ecoles").upsert(
    demo.ecoles.map((e) => ({
      id: e.id,
      nom: e.nom,
      statut: e.statut,
    }))
  ).select();
  console.log("Ecoles inserted:", ecoles?.length, "Error:", errE);

  // 2. Insert Courses
  const { data: courses, error: errC } = await supabase.from("cours").upsert(
    demo.courses.map((c) => ({
      id: c.id,
      ecole_id: c.ecole_id,
      nom_cours: c.nom_cours,
      thematique: c.thematique,
      description: c.description,
      statut: c.statut,
    }))
  ).select();
  console.log("Courses inserted:", courses?.length, "Error:", errC);

  // 3. Insert Modules
  const { data: modules, error: errM } = await supabase.from("modules").upsert(
    demo.modules.map((m) => ({
      id: m.id,
      cours_id: m.cours_id,
      numero_module: m.numero_module,
      sous_titre: m.sous_titre,
      url_cours: m.url_cours,
    }))
  ).select();
  console.log("Modules inserted:", modules?.length, "Error:", errM);
}

seed().catch(console.error);
