// Catalogue multilingue vape24be — sélectionne la liste de produits de la langue courante.
// Les 3 fichiers produits partagent la même structure que products.json ({generatedAt, products}),
// seule la description diffère (NL/FR/DE). Titres/brands/prix/images inchangés.
import nlCatalog from "../data/products-nl.json";
import frCatalog from "../data/products-fr.json";
import deCatalog from "../data/products-de.json";
import { PRICE_MULTIPLIER } from "./site";
import type { Lang } from "./i18n";
import type { Product } from "./types";

type Catalog = { generatedAt?: string; products: Product[] };

const rawCatalogs: Record<Lang, Catalog> = { nl: nlCatalog, fr: frCatalog, de: deCatalog };

// Majoration BE appliquée UNE fois à la charge : chaque produit voit son
// price_eur multiplié par PRICE_MULTIPLIER (arrondi au centime). Les packs
// dérivent ensuite du prix unitaire majoré.
const CATALOGS: Record<Lang, Catalog> = Object.fromEntries(
  Object.entries(rawCatalogs).map(([lang, cat]) => [
    lang,
    {
      ...cat,
      products: cat.products.map((p) => ({
        ...p,
        price_eur: Math.round(p.price_eur * PRICE_MULTIPLIER * 100) / 100,
      })),
    },
  ])
) as Record<Lang, Catalog>;

/** Tous les produits de la langue donnée. */
export function getProducts(lang: Lang): Product[] {
  return CATALOGS[lang].products;
}

/** Un produit par handle, ou undefined. */
export function getProduct(lang: Lang, handle: string): Product | undefined {
  return CATALOGS[lang].products.find((p) => p.handle === handle);
}

/** Dictionnaire handle → produit pour la langue donnée (recherche O(1)). */
export function productByHandle(lang: Lang): Map<string, Product> {
  return new Map(CATALOGS[lang].products.map((p) => [p.handle, p]));
}