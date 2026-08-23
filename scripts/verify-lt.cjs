// Vérifie que les pages produits du build contiennent bien la description LT
// (meta description + JSON-LD Product) — lisible sans erreur UTF-8 via Node.
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const samples = [
  "produktis/ijoy-xp100k-pod-texas-compliant/index.html",
  "produktis/ebcreate-bc-pro-40k-texas-compliant/index.html",
];

function checkRel(rel) {
  const file = path.join(DIST, rel);
  if (!fs.existsSync(file)) { console.log(`MANQUANT: ${rel}`); return; }
  const html = fs.readFileSync(file, "utf8");
  const meta = html.match(/<meta name="description" content="([^"]*)"/);
  const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
  let prodDesc = null;
  for (const b of blocks) {
    if (b.includes('"Product"') || b.includes('"@type":"Product"')) {
      const d = b.match(/"description":"([^"]*)"/);
      if (d) prodDesc = d[1];
    }
  }
  console.log(`\n=== ${rel} ===`);
  console.log("meta description:", meta ? meta[1].slice(0, 200) : "INTROUVABLE");
  console.log("JSON-LD Product description:", prodDesc ? prodDesc.slice(0, 200) : "(pas trouvé)");
}

for (const r of samples) checkRel(r);
console.log("\nVérif terminée.");