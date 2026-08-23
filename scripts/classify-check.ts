// Test de distribution de la classification — run: npx tsx scripts/classify-check.ts
import productsData from "../src/data/products.json";
import { classify } from "../src/lib/classify";

const all: any[] = Array.isArray(productsData) ? productsData : (productsData as any).products;

const out = new Map<string, number>();
const samples = new Map<string, string[]>();
let noDesc = 0;

for (const p of all) {
  const c = classify({ title: p.title, description: p.description, tags: p.tags });
  const key = `${c.cat} > ${c.sub}`;
  out.set(key, (out.get(key) || 0) + 1);
  const arr = samples.get(key) || [];
  if (arr.length < 3 && !arr.includes(p.title)) samples.set(key, [...arr, p.title]);
  if (!p.description) noDesc++;
}

const sorted = [...out.entries()].sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) {
  console.log(String(v).padStart(5), k);
  for (const t of samples.get(k) || []) console.log("        e.g.", t);
}
console.log("TOTAL", all.length, "| sans description:", noDesc);