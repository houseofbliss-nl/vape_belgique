// Arbre de navigation : catégorie racine → sous-catégories (classify.ts) → produits.
// Circuit au build : on classifie les 2181 produits, on groupe par (cat, sub),
// on calcule comptes + miniatures (1er produit) + marques disponibles pour les filtres.
import productsData from "../data/products.json";
import { classify, CAT_LABELS, SUBS_LABELS, SUBS_ORDER } from "./classify";
import type { Product } from "./types";

export interface Brand {
  name: string; // vendor brut
  slug: string; // identifiant de filtre
  count: number;
}

/** Slug de marque — utilisé côté build ET dans le JS de filtrage (il doit correspondre). */
export function brandSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface SubCategory {
  key: string; // e.g. "iki-10k"
  cat: string; // e.g. "vienkartiniai"
  label: string; // libellé affiché
  count: number;
  handles: string[];
  image: string; // miniature (1re image du bucket)
  brands: Brand[];
}

export interface CategoryNode {
  id: string; // cat key
  label: string; // nom lituanien
  count: number; // total produits
  image: string; // miniature de la catégorie
  subs: SubCategory[]; // ordre de SUBS_ORDER
}

const all = (Array.isArray(productsData) ? productsData : productsData.products) as Product[];

// byHandle partagé (construit avant build()).
const byHandle = new Map(all.map((p) => [p.handle, p]));

interface Bucket extends SubCategory {
  images: string[];
}

const ORDER: (keyof typeof SUBS_ORDER)[] = ["vienkartiniai", "esultys", "nicotine-pouches", "priedai"];

function buildSubmap(): Map<string, Bucket> {
  const m = new Map<string, Bucket>();
  for (const p of all) {
    const { cat, sub } = classify({ title: p.title, description: p.description, tags: p.tags });
    const key = `${cat}::${sub}`;
    const b = m.get(key) || {
      key: sub,
      cat,
      label: SUBS_LABELS[sub] || sub,
      count: 0,
      handles: [],
      image: "",
      brands: [],
      images: [],
    };
    b.handles.push(p.handle);
    if (b.images.length < 4 && p.image) b.images.push(p.image);
    b.count++;
    b.image = b.images[0] || "";
    m.set(key, b);
  }

  // Marques par sous-catégorie (vendor distinct = marque, trié par nb produits).
  for (const b of m.values()) {
    const byVendor = new Map<string, number>();
    for (const h of b.handles) {
      const p = byHandle.get(h);
      if (!p || !p.vendor) continue;
      byVendor.set(p.vendor, (byVendor.get(p.vendor) || 0) + 1);
    }
    b.brands = [...byVendor.entries()]
      .map(([name, n]) => ({ name, slug: brandSlug(name), count: n }))
      .sort((a, z) => z.count - a.count || a.name.localeCompare(z.name));
  }
  return m;
}

function buildCategories(m: Map<string, Bucket>): CategoryNode[] {
  return ORDER.map((catId) => {
    const subs = (SUBS_ORDER[catId] || [])
      .map((s) => m.get(`${catId}::${s}`))
      .filter((b): b is Bucket => Boolean(b))
      .map<SubCategory>(({ key, cat, label, count, handles, image, brands }) => ({
        key, cat, label, count, handles, image, brands,
      }));
    return {
      id: catId,
      label: CAT_LABELS[catId],
      count: subs.reduce((s, x) => s + x.count, 0),
      image: subs[0]?.image || "",
      subs,
    };
  });
}

const submap = buildSubmap();
export const BY_CAT_SUB: Map<string, Bucket> = submap;
export const TAXONOMY: CategoryNode[] = buildCategories(submap);

export function categoryByCat(catId: string): CategoryNode | undefined {
  return TAXONOMY.find((c) => c.id === catId);
}