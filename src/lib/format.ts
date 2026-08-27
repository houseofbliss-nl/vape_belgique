// Helpers de formatage (prix EUR) — adaptés au catalogue VAPELT.
import { t } from "./i18n";
import type { Lang } from "./i18n";

/** Formatte un prix EUR : 16.95 → "16,95 €". */
export function formatPrice(price: number | null | undefined, lang: Lang = "nl"): string {
  if (price == null || Number.isNaN(price)) return t(lang, "product.priceRequest");
  return `${price.toFixed(2).replace(".", ",")} €`;
}

/** Version compacte sans symbole pour chips packs (ex. "30,85"). */
export function formatPriceNoSymbol(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return "—";
  return price.toFixed(2).replace(".", ",");
}