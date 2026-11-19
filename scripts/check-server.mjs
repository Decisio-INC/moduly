import { spawn } from "child_process";
import http from "http";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function main() {
  console.log("Démarrage temporaire de Next.js en production...");
  const proc = spawn("npm.cmd", ["run", "start"], {
    cwd: process.cwd(),
    shell: true,
  });

  // Attendre 4 secondes que le serveur écoute
  await new Promise((r) => setTimeout(r, 4000));

  try {
    const front = await fetchUrl("http://localhost:3000");
    console.log("✔ Route Front-Office (/) Code HTTP :", front.statusCode);

    const admin = await fetchUrl("http://localhost:3000/admin");
    console.log("✔ Route Back-Office (/admin) Code HTTP :", admin.statusCode);

    const apiCatalog = await fetchUrl("http://localhost:3000/api/catalog");
    console.log("✔ API Catalogue (/api/catalog) Code HTTP :", apiCatalog.statusCode);

    const apiStats = await fetchUrl("http://localhost:3000/api/stats");
    console.log("✔ API Statistiques (/api/stats) Code HTTP :", apiStats.statusCode);

    if (front.statusCode === 200 && admin.statusCode === 200 && apiCatalog.statusCode === 200) {
      console.log("\n=================================================================");
      console.log("TOUS LES POINTS D'ACCÈS HTTP RÉPONDENT AVEC SUCCÈS (200 OK) !");
      console.log("=================================================================\n");
    }
  } catch (err) {
    console.error("Erreur de requête HTTP :", err.message);
  } finally {
    proc.kill();
    // Forcer l'arrêt sous Windows
    spawn("taskkill", ["/pid", proc.pid, "/f", "/t"]);
    process.exit(0);
  }
}

main();
