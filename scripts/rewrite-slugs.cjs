// Post-build Tâche 2 (27/09) — ZÉRO lituanien au niveau des URLs.
// Après `astro build`, les dossiers dist/<lang>/… portent les slugs SOURCES
// (produktis, kategorijos, miestai, zinios, apie + catKeys/subkeys). Ce script :
//   1. renomme chaque segment vers le slug LOCALISÉ par langue ;
//   2. réécrit sitemap-0.xml (Astro l'a généré avec les chemins de construction)
//      pour qu'il matche les URLs FINALES servies (canonical/hreflang).
// ⚠ Les tables ci-dessous doivent rester en SYNCHRO exacte avec src/lib/i18n.ts
//   (SECTION_SLUGS + SLUGS). Toute clé ajoutée là-bas = à reprendre ici.
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const LANGS = ["nl", "fr", "de"];

const SECTION = {
  produktis: { nl: "producten", fr: "produits", de: "produkte" },
  kategorijos: { nl: "categorieen", fr: "categories", de: "kategorien" },
  miestai: { nl: "steden", fr: "villes", de: "staedte" },
  zinios: { nl: "nieuws", fr: "actualites", de: "news" },
  apie: { nl: "over-ons", fr: "a-propos", de: "ueber-uns" },
};

const SLUGS = {
  // racines CatKey + "visi"
  vienkartiniai: { nl: "wegwerpvapes", fr: "vapes-jetables", de: "wegwerfvapes" },
  esultys: { nl: "e-liquids", fr: "e-liquides", de: "e-liquids" },
  priedai: { nl: "apparaten", fr: "appareils", de: "geraete" },
  visi: { nl: "alle", fr: "tous", de: "alle" },
  // puffs
  "iki-10k": { nl: "tot-10k", fr: "jusqu-a-10k", de: "bis-10k" },
  kita: { nl: "overig", fr: "autres", de: "sonstige" },
  // pouches
  "iki-6mg": { nl: "tot-6mg", fr: "jusqu-a-6mg", de: "bis-6mg" },
  // appareils
  modai: { nl: "mods", fr: "mods", de: "mods" },
  poda: { nl: "pods", fr: "pods", de: "pods" },
  talpos: { nl: "tanks", fr: "reservoirs", de: "tanks" },
  seliai: { nl: "coils", fr: "resistances", de: "coils" },
  baterijos: { nl: "batterijen", fr: "batteries", de: "batterien" },
  aksesuarai: { nl: "accessoires", fr: "accessoires", de: "zubehoer" },
};

/** Traduit un segment SANS toucher aux segments non-clés (handles, nicotine-pouches…). */
const map = (seg, lang) => (SECTION[seg] ?? SLUGS[seg] ?? {})[lang] ?? seg;

function renameDir(from, to) {
  if (from !== to && fs.existsSync(from)) fs.renameSync(from, to);
}

// ─── 1) Renommage des dossiers dist/<lang>/… ───────────────────────────────
let renamed = 0;
for (const lang of LANGS) {
  const base = path.join(DIST, lang);
  if (!fs.existsSync(base)) continue;

  // Sections (niveau 1) : produktis, kategorijos, miestai, zinios, apie
  for (const [seg, m] of Object.entries(SECTION)) {
    renameDir(path.join(base, seg), path.join(base, m[lang]));
  }

  // Catégories (niveau 2) puis sous-catégories (niveau 3) DANS « kategorijos »
  const catDir = path.join(base, SECTION.kategorijos[lang]);
  if (fs.existsSync(catDir)) {
    for (const name of fs.readdirSync(catDir)) {
      const full = path.join(catDir, name);
      if (fs.statSync(full).isDirectory() && name in SLUGS) {
        renameDir(full, path.join(catDir, SLUGS[name][lang]));
      }
    }
    for (const cat of fs.readdirSync(catDir)) {
      const catFull = path.join(catDir, cat);
      if (!fs.statSync(catFull).isDirectory()) continue;
      for (const name of fs.readdirSync(catFull)) {
        const full = path.join(catFull, name);
        if (fs.statSync(full).isDirectory() && name in SLUGS) {
          renameDir(full, path.join(catFull, SLUGS[name][lang]));
        }
      }
    }
  }
  console.log(`rewrite-slugs: dist/${lang}/ → slugs localisés OK`);
}

// ─── 2) Sitemap : localiser les <loc> (chemins de construction → finaux) ─────
const sitemap = path.join(DIST, "sitemap-0.xml");
if (!fs.existsSync(sitemap)) {
  console.error("rewrite-slugs: sitemap-0.xml introuvable dans " + DIST);
  process.exit(1);
}
let xml = fs.readFileSync(sitemap, "utf8");
let count = 0;
xml = xml.replace(/(<loc>)(https:\/\/[^<]+?)(<\/loc>)/g, (_m, p1, url, p3) => {
  const m = url.match(/^(https:\/\/[^/]+)\/(nl|fr|de)\/(.*)$/);
  if (!m) return _m;
  const [, host, lang, rest] = m;
  const localized = rest.split("/").map((s) => map(s, lang)).join("/");
  count++;
  return p1 + host + "/" + lang + "/" + localized + p3;
});
fs.writeFileSync(sitemap, xml, "utf8");
console.log(`rewrite-slugs: sitemap-0.xml localisé (${count} <loc> réécrites)`);

// ─── 3) Vérif finale : aucun dossier section/slug lituanien restant ──────────
let left = 0;
for (const lang of LANGS) {
  const base = path.join(DIST, lang);
  if (!fs.existsSync(base)) continue;
  for (const name of fs.readdirSync(base)) {
    if (name in SECTION) { console.warn(`⛔ dist/${lang}/${name} n'a pas été renommé !`); left++; }
  }
}
if (left) process.exit(2);
console.log("rewrite-slugs: terminé, 0 slug lituanien restant dans dist/");