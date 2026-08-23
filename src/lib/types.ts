// Types du catalogue VAPELT (adaptés depuis products.json de vapesale).

export interface Product {
  id: number;
  handle: string;
  title: string;
  vendor: string;
  price_usd: number;
  price_eur: number;
  image: string;
  description: string;
  category: string;
  tags: string[];
}

export interface Category {
  id: string;
  label: string;
  count: number;
  handles: string[];
  image?: string;
}

export interface City {
  slug: string;
  name: string;
  region: string;
  population: number;
  lat: number;
  lng: number;
}

export interface ListItem {
  productId: number;
  quantity: number;
}

export interface BrandEntry {
  slug: string;
  label: string;
  product_count: number;
  image: string;
}