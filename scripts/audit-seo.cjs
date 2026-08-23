// Audit SEO v2 — vérifie og:image, twitter, BreadcrumbList, ItemList, FAQPage sur chaque type de page.
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "..", "dist");
const pages = [
  ["HOME", "index.html"],
  ["CAT", "kategorijos/vienkartiniai/index.html"],
  ["SUB", "kategorijos/vienkartiniai/iki-10k/index.html"],
  ["PROD", "produktis/ijoy-xp100k-pod-texas-compliant/index.html"],
  ["VILLE", "miestai/vilnius/index.html"],
  ["VIL-INDEX", "miestai/index.html"],
  ["APIE", "apie/index.html"],
  ["CART", "cart/index.html"],
];
function typesOf(ld) {
  return [...new Set((ld.match(/"@type"\s*:\s*"([^"]+)"/g) || []).map((x) => x.replace(/"@type"\s*:\s*"/, "").replace(/"$/, "")))];
}
for (const [lbl, rel] of pages) {
  const f = path.join(D, rel);
  if (!fs.existsSync(f)) { console.log(`${lbl}: MANQUANT ${rel}`); continue; }
  const h = fs.readFileSync(f, "utf8");
  const ld = (h.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || []).join("\n");
  const og = h.match(/property="og:image" content="([^"]*)"/);
  const tw = h.includes('name="twitter:image"');
  const ogt = h.match(/property="og:type" content="([^"]*)"/);
  console.log(`=== ${lbl} (/${rel}) ===`);
  console.log(`  types: [${typesOf(ld).join(", ")}]`);
  console.log(`  og:type=${ogt ? ogt[1] : "?"} | og:image=${og ? og[1].slice(0, 55) : "NON"} | twitter:image=${tw ? "OK" : "NON"}`);
  console.log(`  BreadcrumbList=${h.includes("BreadcrumbList") ? "OK" : "non"} | ItemList=${h.includes("ItemList") ? "OK" : "non"} | FAQPage=${h.includes("FAQPage") ? "OK" : "non"}`);
  const desc = h.match(/name="description" content="([^"]*)"/);
  if (rel.startsWith("produktis")) console.log(`  meta desc[150]: ${desc ? desc[1].slice(0, 150) : "?"}`);
  if (rel.startsWith("miestai/vil")) console.log(`  FQA visible paiements: ${h.includes("Dovanų kuponas") ? "OK (4 moyens)" : "PÉRIMÉ"}`);
  console.log("");
}
console.log("robots.txt:", fs.existsSync(path.join(D, "robots.txt")) ? "OK" : "NON");
console.log("404.html:", fs.existsSync(path.join(D, "404.html")) ? "OK" : "NON");
console.log("og-default.png:", fs.existsSync(path.join(D, "images", "og-default.png")) ? "OK" : "NON");
// comptage global og:image
const files = [];
(function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name === "index.html") files.push(p); } })(D);
let nOg = 0, nBc = 0, nIl = 0, nFaq = 0;
for (const f of files) { const h = fs.readFileSync(f, "utf8"); if (h.includes('property="og:image"')) nOg++; if (h.includes("BreadcrumbList")) nBc++; if (h.includes("ItemList")) nIl++; if (h.includes("FAQPage")) nFaq++; }
console.log(`\nGlobal (${files.length} pages) : og:image=${nOg} | BreadcrumbList=${nBc} | ItemList=${nIl} | FAQPage=${nFaq}`);