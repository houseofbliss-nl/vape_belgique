// Buckets classifiés mais absents de SUBS_ORDER (donc invisibles dans l'arbre).
import productsData from "../src/data/products.json";
import { classify, SUBS_ORDER, SUBS_LABELS, CAT_LABELS } from "../src/lib/classify";

const all: any[] = Array.isArray(productsData) ? productsData : (productsData as any).products;

const known = new Map<string, number>();
const missing = new Map<string, { n: number; samples: string[] }>();
for (const p of all) {
  const { cat, sub } = classify({ title: p.title, description: p.description, tags: p.tags });
  const subs = SUBS_ORDER[cat as keyof typeof SUBS_ORDER] || [];
  const key = `${cat}::${sub}`;
  if (!subs.includes(sub)) {
    const r = missing.get(key) || { n: 0, samples: [] };
    r.n++;
    if (r.samples.length < 2 && !r.samples.includes(p.title)) r.samples.push(p.title);
    missing.set(key, r);
  }
}
console.log("SUBS connus par catégorie:");
for (const [cat, subs] of Object.entries(SUBS_ORDER)) {
  console.log(`  ${cat}: ${subs.join(", ")} — ${CAT_LABELS[cat as keyof typeof CAT_LABELS]}`);
}
console.log("\nBuckets MANQUANTS (classifiés mais pas dans SUBS_ORDER):");
for (const [k, r] of missing) {
  console.log(`  ${k}: ${r.n}  e.g. ${r.samples[0]}`);
}