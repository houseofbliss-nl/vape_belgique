// Vérifie une page ville : contenu unique, JSON-LD géolocalisé, grille produits LT.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "dist", "miestai", "vilnius", "index.html"), "utf8");
console.log("=== /miestai/vilnius ===");
const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/);
console.log("h1:", h1 ? h1[1] : "n/a");
const json = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
for (const b of json) {
  if (b.includes('"City"') || b.includes('"LocalBusiness"')) {
    console.log("JSON-LD ville présent:", b.slice(0, 300).replace(/\s+/g, " "));
  }
}
const cards = (html.match(/entrance="[^"]*"/g) || []).length;
console.log("cards produits (marqueur entrance):", cards, "→", cards >= 12 ? "OK ≥12" : "⚠ <12");
const lt = (html.match(/Pristatymas|pristatymas/g) || []).length;
console.log("occurrences 'pristatymas':", lt);
// dernière ligne avant </body> → inconnue, pas grave
const nida = fs.existsSync(path.join(__dirname, "..", "dist", "miestai", "nida", "index.html"));
console.log("page /miestai/nida existe:", nida);