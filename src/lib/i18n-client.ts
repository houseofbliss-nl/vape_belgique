// i18n CLIENT (bundlé, runtime) — pour le JS partagé (cart, order-summary, telegram).
// Astro bundle une seule fois le script par chunck (partagé entre les 3 langues) →
// on détecte la langue courante depuis l'URL à l'exécution.
import nl from "../i18n/nl.json";
import fr from "../i18n/fr.json";
import de from "../i18n/de.json";
import type { Lang } from "./i18n";

const DICTS: Record<Lang, Record<string, string>> = {
  nl: nl as unknown as Record<string, string>,
  fr: fr as unknown as Record<string, string>,
  de: de as unknown as Record<string, string>,
};

/** Langue courante d'après l'URL (ex. /fr/produktis/x). Défaut nl. */
export function detectLang(): Lang {
  const m = window.location.pathname.match(/^\/(nl|fr|de)(?:[/?#]|$)/);
  return (m?.[1] as Lang) || "nl";
}

export function tRuntime(key: string, vars?: Record<string, string | number>): string {
  const lang = detectLang();
  let s = DICTS[lang][key] ?? nl[key as keyof typeof nl] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function fmtEur(p: number | null | undefined): string {
  if (p == null || Number.isNaN(p)) return tRuntime("product.priceRequest");
  return `${p.toFixed(2).replace(".", ",")} €`;
}

export function pRuntime(path: string): string {
  const lang = detectLang();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}

export function langBase(): string {
  return `/${detectLang()}`;
}