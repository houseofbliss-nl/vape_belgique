// Diag v3 : valide la NOUVELLE logique de classification proposée.
import fs from "node:fs";

const { products } = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const clean = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const blobOf = (p) => clean(`${p.title} ${p.description} ${(p.tags || []).join(" ")}`);
const rawOf = (p) => `${p.title} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase();

// ——— signaux ———
const BOTTLE_TITLE_RE = /\b(e-?liquid|e-?juice|nic ?salt|salt ?nic|nic ?shot|shortfill|freebase)\b/i;
const TITLE_DISPOSABLE = /\b(disposable|refillable)\b/i;
const K_PUFFS = /\d{1,6}\s?k\b|\d{3,6}\s*puffs?\b/;
const DIGITS47 = /\d{4,7}/;
const KIT_WORDS = /\b(kit|starter|bundle|set)\b|rinkin|komplekt/i;
const DEV_DESC = /\b\d{1,4}\s*mah\b|built-?in\s*(battery|batterij)|internal\s*(battery|batterij)|\brecharge\w*\b|\bdisposable\b|\b\d{2,7}\s*puffs?\b|draw-?activated|auto-?draw|pre-?fill\w*|straight out of the box/i;

function eLiquidSignals(blob, tags) {
  if (/\be-?liquid\b|\be-?juice\b|vapo ?jugje|nic ?salt|salt ?nic|\bsaltnic\b|nic ?shot|shortfill|freebase|vape ?juice|vape ?sauce|\bjuice\b/i.test(blob)) return true;
  return tags.some((t) =>
    ["e-liquid", "vape juice", "nic salt", "nic-salt", "nic shot", "e-juice", "salt nic", "shortfill", "freebase", "juice"].includes(t) ||
    (/\bml\b/.test(t) && /juice|salt|shot|e.?liquid/.test(t))
  );
}

function classify(p) {
  const title = clean(p.title || "");
  const titleRaw = (p.title || "").toLowerCase();
  const blob = blobOf(p);
  const raw = rawOf(p);
  const tags = (p.tags || []).map((t) => t.toLowerCase());

  // 1. POUCHES
  if (tags.some((t) => t.includes("pouch")) || /\bpouch\b|nicopod/.test(blob)) return "nicotine-pouches";

  // 2. E-LIQUID BOUTEILLE par le TITRE (mot e-liquid + volume ml)
  if (BOTTLE_TITLE_RE.test(titleRaw) && /\b\d{1,3}\s*ml\b/.test(titleRaw)) return "esultys";

  // 3. DISPOSABLE par le TITRE (K-number / puffs / chiffres 4-7 / disposable / refillable)
  if (TITLE_DISPOSABLE.test(titleRaw) || K_PUFFS.test(titleRaw) || DIGITS47.test(titleRaw)) return "vienkartiniai";

  // 3.5 KIT-APPAREIL par le TITRE (kit/starter/rinkinys/komplekt/bundle/set SANS marqueur disposable) → Prietaisai
  // Ex : « Uwell V6 Kit », « Voopoo Argus P1s 25W rinkinys », « Aspire Pixo Pod Vape Kit 30W »
  // PAS: « Geek Bar MATE 60K KIT » (60K = disposable, déjà sorti en step 3)
  if (KIT_WORDS.test(titleRaw)) return "priedai";

  // 4. APPAREIL/DISPOSABLE par la DESCRIPTION (signaux forts) — avant e-liquid
  if (DEV_DESC.test(raw)) {
    // Sinon = disposable (mAh, x puffs, rechargeable, pré-rempli…)
    return "vienkartiniai";
  }

  // 5. APPAREIL par tokens du TITRE (safe : bouteilles déjà sorties en step 2)
  if (/\b(kit|coil|atomizer|\brda\b|\brta\b|\brba\b|mod|box ?mod|bater|18650|21700|pod|tank|sub-?ohm|drip-?tip|mouth-?piece|brush|cleaning)\b/i.test(titleRaw)) return "priedai";

  // 6. E-LIQUID par la description
  if (eLiquidSignals(blob, tags)) return "esultys";

  // 7. DEFAULT → disposable
  return "vienkartiniai";
}

// Compte par catégorie
const counts = {};
const esultys = [];
const priedai = [];
for (const p of products) {
  const cat = classify(p);
  counts[cat] = (counts[cat] || 0) + 1;
  if (cat === "esultys") esultys.push(p);
  if (cat === "priedai" || cat === "vienkartiniai") priedai.push({ p, cat });
}
console.log("NOUVEAUX comptes:", counts);

// Anomalies restantes ?
const devInE = esultys.filter((p) => DEV_DESC.test(rawOf(p)));
console.log("\n⚠️ esultys avec signaux dispositifs restants:", devInE.length);
devInE.forEach((p) => console.log("  • " + p.title + " [" + p.vendor + "]"));

// Vérif produits ciblés
console.log("\n--- Produits ciblés ---");
for (const t of ["Monster Bar MINI 800", "Hyde Color Recharge", "Hyde Curve PLUS", "Hyde Color PLUS", "Voopoo Argus P1s 25W rinkinys", "Aroma King 20mg Nic Salt E-Liquid 10ml", "MRKT PLCE Salt x Uwell V6 Kit", "Geek Bar MATE 60K KIT", "Aspire Pixo Pod Vape Kit 30W", "Digiflavor BRK Full Kit", "20mg SKE Crystal CL6000 vienkartinis įkraunamas Vape Kit 6000 Puffs"]) {
  const p = products.find((x) => x.title === t);
  if (p) console.log("  " + classify(p).padEnd(14) + " ← " + p.title);
  else console.log("  (introuvable) " + t);
}

// Sous-comptes esultys vs avant
console.log("\n--- E-sultys: lyokan? (échantillon pour sanity) ---");
esultys.slice(0,5).forEach((p) => console.log("  • " + p.title));

// Sanity 1 : e-liquides dont le TITRE contient un mot kit mais PAS de ml (risque de misrouting)
console.log("\n--- RISQUE: titres e-liquid-words + kit/set sans ml ---");
for (const p of products) {
  const t = (p.title || "").toLowerCase();
  if (BOTTLE_TITLE_RE.test(t) && KIT_WORDS.test(t) && !/\b\d{1,3}\s*ml\b/.test(t)) {
    console.log("  ⚠ " + p.title);
  }
}
console.log("  (fin)");