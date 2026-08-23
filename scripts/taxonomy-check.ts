// Test arbre de navigation — run: npx tsx scripts/taxonomy-check.ts
import { TAXONOMY } from "../src/lib/taxonomy";

let total = 0;
for (const cat of TAXONOMY) {
  console.log(`\n${cat.label} (${cat.count}) — img: ${cat.image ? "ok" : "MANQUE"}`);
  for (const s of cat.subs) {
    total += s.count;
    console.log(
      `  ${s.label.padEnd(22)} ${String(s.count).padStart(4)}  img:${s.image ? "ok" : "!"}  brands:${s.brands.length}  e.g. ${s.brands.slice(0, 3).map((b) => b.name).join(", ")}`
    );
  }
}
console.log(`\nTOTAL catégories: ${total}`);