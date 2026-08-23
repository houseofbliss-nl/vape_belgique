// Sonde : vérifie si des produits "disposables" (spec 900mAh, puffs, bar style)
// se retrouvent encore dans E-sultys (esultys) à cause d'un classifieur trop permissif.
import { readFileSync } from "node:fs";
import { classify } from "../src/lib/classify.ts";

const raw = JSON.parse(readFileSync(new URL("../src/data/products.json", import.meta.url), "utf8"));
const all = Array.isArray(raw) ? raw : raw.products;

const hitsInELiquid = [];
const totalByCat = {};
for (const p of all) {
  const { cat, sub } = classify({ title: p.title, description: p.description, tags: p.tags });
  totalByCat[cat] = (totalByCat[cat] || 0) + 1;
  const blob = `${p.title} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
  const looksLikeDisposable =
    /\d{1,4}\s*mah/.test(blob) || /\b\d{2,7}\s*puffs?\b/.test(blob) || /\b(disposable|prefilled|pre-?filled)\b/.test(blob);
  if (cat === "esultys" && looksLikeDisposable) {
    hitsInELiquid.push({ title: p.title, vendor: p.vendor, desc: (p.description || "").slice(0, 160) });
  }
}

console.log("=== Totaux par catégorie ===", totalByCat);
console.log(`\n=== ${hitsInELiquid.length} produits à allure "mAh/puffs" classés en E-sultys ===`);
for (const h of hitsInELiquid.slice(0, 25)) {
  console.log(`- [${h.vendor ?? "?"}] ${h.title}\n    desc: ${h.desc}`);
}