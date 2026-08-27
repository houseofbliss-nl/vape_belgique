// Catalogue léger pour les pages client-side (my-list / order-summary).
// Le JSON complet (2,3 Mo) contient description/tags inutiles au panier ;
// on n'embarque ici que les champs nécessaires au lookup client (~580 Ko).
import productsData from "../data/products-en.json";
import type { Product } from "./types";
import { deriveSpec } from "./spec";

const all = (Array.isArray(productsData) ? productsData : productsData.products) as Product[];

export interface SlimProduct {
  id: number;
  handle: string;
  title: string;
  vendor: string;
  image: string;
  price_eur: number;
  spec: string;
}

export const SLIM_CATALOG: SlimProduct[] = all.map((p) => ({
  id: p.id,
  handle: p.handle,
  title: p.title,
  vendor: p.vendor,
  image: p.image,
  price_eur: p.price_eur,
  spec: deriveSpec(p.description),
}));