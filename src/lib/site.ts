// Constantes du site VAPELT mobile — branding + SEO.
import { TELEGRAM_HANDLE } from "./telegram";

export const SITE_NAME = "VAPELT";
export const SITE_TITLE = "VAPELT — Elektroninės cigaretės ir vapingas Lietuvoje";
export const SITE_URL = "https://vapelt.dealsnows.com";
export const SITE_LANG = "lt";
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;

/** Pays de livraison (code ISO 3166-1 alpha-2) — utilisé dans le schema offers
 *  (shippingDetails + hasMerchantReturnPolicy). À adapter pour FI/EE/BE. */
export const SHIPPING_COUNTRY = "LT";

/** Description par défaut (SEO) — lituanien. */
export const SITE_DESCRIPTION =
  "VAPELT — elektroninės cigaretės, vienkartiniai garintuvai, e-skysčiai ir nikotino pagalvėlės. Pristatome visoje Lietuvoje. Užsakymas per Telegram.";

/** Coordonnées géo (Vilnius) pour schema LocalBusiness/OnlineStore. */
export const ORG_ADDRESS = {
  street: "Gedimino pr. 1",
  city: "Vilnius",
  region: "Vilniaus apskritis",
  country: "LT",
  postalCode: "01103",
  lat: 54.6872,
  lng: 25.2797,
};
