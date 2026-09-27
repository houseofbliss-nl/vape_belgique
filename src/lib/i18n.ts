// i18n central pour vape24be (Belgique — NL / FR / DE).
// Dictionnaires : src/i18n/{nl,fr,de}.json (strings UI + labels catégories).
// - t(lang, key, vars?)  → traduction avec remplacement {var}
// - p(lang, path)        → préfixe un chemin interne avec la langue (/nl/…)
// - LANG_NAMES/LOCALES   → sélecteur de langue + <html lang> et og:locale
import nl from "../i18n/nl.json";
import fr from "../i18n/fr.json";
import de from "../i18n/de.json";

export type Lang = "nl" | "fr" | "de";

export const LANGS: Lang[] = ["nl", "fr", "de"];

/** Noms natifs (sélecteur de langue). */
export const LANG_NAMES: Record<Lang, string> = {
  nl: "Nederlands",
  fr: "Français",
  de: "Deutsch",
};

/** Locales BCP-47 pour <html lang>, og:locale et toLocaleDateString. */
export const LANG_LOCALES: Record<Lang, string> = {
  nl: "nl-BE",
  fr: "fr-BE",
  de: "de-BE",
};

type Dict = typeof nl;
const DICTS: Record<Lang, Dict> = { nl, fr, de };

/** Traduction : clé plate ("footer.copyright") avec {vars} substituées. */
export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const d = DICTS[lang] as unknown as Record<string, string>;
  let s = d[key] ?? nl[key as keyof Dict] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

/** Nom de ville localisé (`cities.<slug>`), repli sur le nom du JSON (FR par défaut). */
export function cityName(lang: Lang, city: { slug: string; name: string }): string {
  return t(lang, `cities.${city.slug}`) === `cities.${city.slug}` ? city.name : t(lang, `cities.${city.slug}`);
}

// ═══ Tâche 2 (27/09) — slugs d'URL par langue, ZÉRO lituanien ═══
// Le dossier source des pages est UNIQUE ([lang]/produktis, kategorijos…) donc
// identique pour les 3 langues. Ces tables traduisent chaque segment vers la
// langue. Elles font foi pour : p()/localizePath() (liens + canonical/hreflang
// dans Base.astro) ET le script de post-build scripts/rewrite-slugs.cjs qui
// renomme dist/ · sitemap-0.xml pour retrouver les mêmes URLs physiques.
// ⚠ Toute clé ajoutée ici doit être reprisée dans scripts/rewrite-slugs.cjs.

/** Slugs de SECTION — premier segment d'URL après la langue (source → par langue). */
export const SECTION_SLUGS: Record<string, Record<Lang, string>> = {
  produktis: { nl: "producten", fr: "produits", de: "produkte" },
  kategorijos: { nl: "categorieen", fr: "categories", de: "kategorien" },
  miestai: { nl: "steden", fr: "villes", de: "staedte" },
  zinios: { nl: "nieuws", fr: "actualites", de: "news" },
  apie: { nl: "over-ons", fr: "a-propos", de: "ueber-uns" },
};

/** Slugs de CATÉGORIES / SOUS-CATÉGORIES (clé lituanienne de classify.ts → par langue). */
export const SLUGS: Record<string, Record<Lang, string>> = {
  // racines CatKey (classify.ts) + "visi"
  vienkartiniai: { nl: "wegwerpvapes", fr: "vapes-jetables", de: "wegwerfvapes" },
  esultys: { nl: "e-liquids", fr: "e-liquides", de: "e-liquids" },
  priedai: { nl: "apparaten", fr: "appareils", de: "geraete" },
  visi: { nl: "alle", fr: "tous", de: "alle" },
  // puffs (SUBS_ORDER.vienkartiniai)
  "iki-10k": { nl: "tot-10k", fr: "jusqu-a-10k", de: "bis-10k" },
  kita: { nl: "overig", fr: "autres", de: "sonstige" },
  // pouches
  "iki-6mg": { nl: "tot-6mg", fr: "jusqu-a-6mg", de: "bis-6mg" },
  // appareils (SUBS_ORDER.priedai)
  modai: { nl: "mods", fr: "mods", de: "mods" },
  poda: { nl: "pods", fr: "pods", de: "pods" },
  talpos: { nl: "tanks", fr: "reservoirs", de: "tanks" },
  seliai: { nl: "coils", fr: "resistances", de: "coils" },
  baterijos: { nl: "batterijen", fr: "batteries", de: "batterien" },
  aksesuarai: { nl: "accessoires", fr: "accessoires", de: "zubehoer" },
};

/** Traduit chaque segment d'un chemin DE CONSTRUCTION vers la langue (idempotent :
    un segment déjà localisé n'est pas une clé → inchangé). */
export function localizePath(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean
    .split("/")
    .map((seg) => SECTION_SLUGS[seg]?.[lang] ?? SLUGS[seg]?.[lang] ?? seg)
    .join("/");
}

/** Préfixe un chemin INTERNE avec la langue sans toucher aux slugs : chemin de
    CONSTRUCTION (ex. pBuild("nl","/produktis/x") → "/nl/produktis/x"). Réservé à
    canonicalPath : Base.astro a besoin de la construction pour générer les
    hreflang alternates (il localise lui-même par langue cible). */
export function pBuild(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}

/** Préfixe un chemin interne avec la langue ET traduit les slugs par langue :
    p("nl", "/produktis/x") → "/nl/producten/x" (URL FINALE servie). Tous les
    liens internes (<a href>, JSON-LD, panier, search…) doivent utiliser p(). */
export function p(lang: Lang, path: string): string {
  return localizePath(lang, pBuild(lang, path));
}

/** Déduit le chemin SANS préfixe langue (pour hreflang alternates). */
export function stripLang(lang: Lang, path: string): string {
  const prefix = `/${lang}`;
  return path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
}

/** Route générée par Astro pour une langue (base "/[lang]/..." sans leading slash). */
export function langStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang }, props: { lang } }));
}