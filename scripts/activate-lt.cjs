// Bascule du catalogue sur la version traduite LT (à exécuter APRÈS translate-descriptions.cjs)
// 1. Sauvegarde l'original EN → src/data/products-en.json (si pas déjà fait)
// 2. Copie products-lt.json → products.json (description = LT, description_en conservée)
// Les imports existants (../data/products.json) restent valides sans modification.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src", "data", "products.json");
const LT = path.join(ROOT, "src", "data", "products-lt.json");
const EN = path.join(ROOT, "src", "data", "products-en.json");

if (!fs.existsSync(LT)) {
  console.error("products-lt.json introuvable — exécuter d'abord translate-descriptions.cjs");
  process.exit(1);
}

const lt = JSON.parse(fs.readFileSync(LT, "utf8"));
const ltArr = Array.isArray(lt) ? lt : lt.products;
const translated = ltArr.filter((p) => p.description_en);
console.log(`Produits traduits dans LT : ${translated.length} / ${ltArr.length}`);

if (translated.length < ltArr.length - 50) {
  console.error("Trop de descriptions non traduites — abandon de la bascule.");
  process.exit(1);
}

// 1. Sauvegarde EN (une seule fois — ne pas écraser si existe déjà)
if (!fs.existsSync(EN)) {
  fs.copyFileSync(SRC, EN);
  console.log(`Sauvegarde EN créée : ${EN}`);
} else {
  console.log("products-en.json existe déjà — conservé.");
}

// 2. Écrit products.json avec descriptions LT
const nonTranslated = ltArr.filter((p) => !p.description_en);
const merged = ltArr.map((p) => (p.description_en ? { ...p, description: p.description } : p));
fs.writeFileSync(SRC, JSON.stringify(Array.isArray(lt) ? merged : { ...lt, products: merged }, null, 2), "utf8");
console.log(`products.json réécrit : ${merged.length} produits, descriptions LT actives.`);
console.log("Vérifier le build ensuite (astro build).");