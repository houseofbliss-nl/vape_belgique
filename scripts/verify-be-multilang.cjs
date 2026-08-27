// Vérification finale multilingue vape24be (NL/FR/DE).
// Vérifie dans dist/ :
//  • présence des 3 langues (/nl /fr /de) + pages types (home, apie, miestai, produits…)
//  • <html lang> = nl-BE / fr-BE / de-BE
//  • og:locale cohérent
//  • hreflang alternates NL/FR/DE + x-default
//  • descriptions produits traduites (pas de LT, langue correcte par page)
//  • noms de villes localisés
//  • absence de mots UI lituaniens résiduels
// Usage : node scripts/verify-be-multilang.cjs
const fs = require("fs");
const path = require("path");
const DIST = path.join(__dirname, "..", "dist");

let errors = 0, checks = 0;
const ok = (m) => checks++;
const fail = (m) => { errors++; console.error("  ✗ " + m); };

const LANGS = ["nl", "fr", "de"];
const LOCALE = { nl: "nl-BE", fr: "fr-BE", de: "de-BE" };
// Signatures de langue pour le 1er produit (iJoy XP100K) — traductions réelles.
const DESC_SIG = {
  nl: "Maak kennis met de iJoy XP100K",
  fr: "Découvrez l'iJoy XP100K",
  de: "Entdecken Sie den iJoy XP100K",
};
// Noms de ville localisés (Brussel/Bruxelles/Brüssel pour slug bruxelles).
const CITY_SIG = { nl: "Brussel", fr: "Bruxelles", de: "Brüssel" };
// Mots UI lituaniens résiduels interdits.
const LT_WORDS = ["Pridėti", "Prekės", "Krepšelis", "Pašalinti", "Atsiskaityti", "Mano sąrašas", "Sutaupote", "Visos prekės"];

for (const lang of LANGS) {
  const dir = path.join(DIST, lang);
  if (!fs.existsSync(dir)) { fail(`${lang}: dossier absent`); continue; }

  // — html lang + og:locale sur la home —
  const home = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  if (home.includes(`<html lang="${LOCALE[lang]}"`)) ok(`${lang} html lang`); else fail(`${lang} html lang (attendu ${LOCALE[lang]})`);
  if (home.includes(`content="${LOCALE[lang]}"`)) ok(`${lang} og:locale`); else fail(`${lang} og:locale`);

  // — hreflang —
  for (const l of LANGS) {
    if (home.includes(`hreflang="${LOCALE[l]}"`)) ok(`${lang} hreflang ${l}`); else fail(`${lang} hreflang ${l}`);
  }
  if (home.includes(`hreflang="x-default"`)) ok(`${lang} hreflang x-default`); else fail(`${lang} hreflang x-default`);

  // — pages types présentes —
  const types = ["apie", "privacy", "zinios", "kategorijos", "miestai", "cart", "order-summary"];
  for (const t of types) {
    if (fs.existsSync(path.join(dir, t))) ok(`${lang}/${t}`); else fail(`${lang}/${t} manquant`);
  }

  // — description produit traduite (pas de LT) —
  const prodFile = path.join(dir, "produktis", "ijoy-xp100k-pod-texas-compliant", "index.html");
  if (fs.existsSync(prodFile)) {
    const prod = fs.readFileSync(prodFile, "utf8");
    if (prod.includes(DESC_SIG[lang])) ok(`${lang} description produit`); else fail(`${lang} description produit (signature ${DESC_SIG[lang].slice(0, 20)}…)`);
    if (prod.includes("Susipažinkite")) fail(`${lang} description encore LT !`);
  }

  // — nom de ville localisé —
  const cityFile = path.join(dir, "miestai", "bruxelles", "index.html");
  if (fs.existsSync(cityFile)) {
    const city = fs.readFileSync(cityFile, "utf8");
    if (city.includes(CITY_SIG[lang])) ok(`${lang} nom ville Bruxelles`); else fail(`${lang} nom ville Bruxelles (attendu ${CITY_SIG[lang]})`);
  }

  // — pas de mots LT résiduels sur la home —
  const lower = home.toLowerCase();
  for (const w of LT_WORDS) {
    if (lower.includes(w.toLowerCase())) fail(`${lang} terme LT résiduel « ${w} »`);
  }
}

console.log(`\n${LANGS.length} langues — ${checks} vérifs OK, ${errors} erreur(s).`);
process.exit(errors ? 1 : 0);