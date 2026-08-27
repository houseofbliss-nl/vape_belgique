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

/** Préfixe un chemin interne avec la langue : p("nl", "/produktis/x") → "/nl/produktis/x". */
export function p(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
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