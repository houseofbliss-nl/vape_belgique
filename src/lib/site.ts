// Constantes du site vape24be mobile — branding + SEO (Belgique, 3 langues).
import { TELEGRAM_HANDLE } from "./telegram";

export const SITE_NAME = "vape24be";
export const SITE_TITLE = "vape24be — Vapes & e-sigaretten in België";
export const SITE_URL = "https://vape24be.dealsnows.com";
export const SITE_LANG = "nl";
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;

/** Pays de livraison (code ISO 3166-1 alpha-2) — utilisé dans le schema offers
 *  (shippingDetails + hasMerchantReturnPolicy). */
export const SHIPPING_COUNTRY = "BE";

/** Description par défaut (SEO) — néerlandais (langue par défaut). */
export const SITE_DESCRIPTION =
  "vape24be — e-sigaretten, wegwerpvapes, e-liquids en nicotine pouches. Levering in heel België. Bestellen via Telegram.";

/** Coordonnées géo (Bruxelles) pour schema LocalBusiness/OnlineStore. */
export const ORG_ADDRESS = {
  street: "Rue de la Loi 1",
  city: "Brussel",
  region: "Brussels Hoofdstedelijk Gewest",
  country: "BE",
  postalCode: "1000",
  lat: 50.8503,
  lng: 4.3517,
};
