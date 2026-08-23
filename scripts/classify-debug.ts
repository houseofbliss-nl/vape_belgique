// Debug : Pillow Talk FC40000 avec description réelle
import productsData from "../src/data/products.json";
import { classify } from "../src/lib/classify";

const all: any[] = Array.isArray(productsData) ? productsData : (productsData as any).products;

for (const p of all) {
  const t = (p.title || "").toLowerCase();
  if (t.includes("fc40000") || t.includes("ic40000") || t.includes("sc40000")) {
    console.log("TITLE:", p.title);
    console.log("DESC :", (p.description || "").slice(0, 300));
    const c = classify({ title: p.title, description: p.description, tags: p.tags });
    console.log("  →", c.cat, ">", c.sub);
    console.log("");
  }
}