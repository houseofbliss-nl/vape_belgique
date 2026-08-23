// Validation du VRAI classify.ts (imports reels via Node type-stripping).
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const mod = await import(pathToFileURL("src/lib/classify.ts").href + "?t=" + Date.now());
const { classify } = mod;

const raw = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const products = raw.products || raw;

const counts = {};
const subs = {};
const esultys = [];
const priedai = [];
for (const p of products) {
  const c = classify({ title: p.title, description: p.description, tags: p.tags });
  counts[c.cat] = (counts[c.cat] || 0) + 1;
  const k = c.cat + "::" + c.sub;
  subs[k] = (subs[k] || 0) + 1;
  if (c.cat === "esultys") esultys.push(p.title);
  if (c.cat === "priedai") priedai.push(p.title);
}
console.log("COMPTES par categorie :", JSON.stringify(counts));
console.log("Total:", Object.values(counts).reduce((a, b) => a + b, 0));

console.log("\n--- Produits cibles ---");
const targets = [
  "Monster Bar MINI 800",
  "Hyde Color Recharge",
  "Hyde Curve PLUS",
  "Hyde Color PLUS",
  "Voopoo Argus P1s 25W rinkinys",
  "MRKT PLCE Salt x Uwell V6 Kit",
  "Geek Bar MATE 60K KIT",
  "Aspire Pixo Pod Vape Kit 30W",
  "Digiflavor BRK Full Kit",
  "20mg SKE Crystal CL6000 vienkartinis ikraunami Vape Kit 6000 Rulls",
  "Juice Head Salts x GeekVape Sonder U Kit",
];
for (const t of targets) {
  const p = products.find((x) => x.title && x.title.includes(t.slice(0, 10)));
  if (!p) { console.log("  (?) " + t); continue; }
  const r = classify({ title: p.title, description: p.description, tags: p.tags });
  console.log("  " + r.cat.padEnd(16) + r.sub.padEnd(12) + " <- " + p.title);
}

// Aroma King (doit rester esultys)
const a = products.find((x) => (x.title || "").toLowerCase().includes("aroma king 20mg nic salt"));
if (a) {
  const r = classify({ title: a.title, description: a.description, tags: a.tags });
  console.log("  " + r.cat.padEnd(16) + r.sub.padEnd(12) + " <- " + a.title);
}

// Sous-comptes pris
console.log("\nTop sous-cats:");
for (const [k, v] of Object.entries(subs).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log("  " + k + " = " + v);

const esultysSmall = esultys.slice(0, 4);
console.log("\nEchantillon esultys:", esultysSmall.join(" | "));
console.log("PRIEDAIS count:", priedai.length);