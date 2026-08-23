// Vérifie la meta description produit enrichie (extrait LT).
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "..", "dist");
const handles = [
  "produktis/ijoy-xp100k-pod-texas-compliant/index.html",
  "produktis/ebcreate-bc-pro-40k-texas-compliant/index.html",
];
for (const rel of handles) {
  const h = fs.readFileSync(path.join(D, rel), "utf8");
  const d = h.match(/name="description" content="([^"]*)"/)?.[1] || "?";
  console.log(`[${rel.split("/")[1]}]`);
  console.log(`  ${d}`);
  console.log(`  (${d.length} caractères)`);
}
// et un éditorial LT dans la JSON-LD Product
const p = fs.readFileSync(path.join(D, "produktis", "ebcreate-bc-pro-40k-texas-compliant", "index.html"), "utf8");
const ld = p.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
const prod = ld.find((x) => x.includes('"Product"'));
console.log("\nProduct JSON-LD desc:", (prod.match(/"description":"([^"]{0,80})/) || [])[1] || "?");