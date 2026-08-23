// Audit SEO final — après full pass : noindex panier, sitemap filtré, ItemList villes.
const fs = require("fs");
const path = require("path");
const D = path.join(__dirname, "..", "dist");

// 1. noindex cart + order-summary
for (const rel of ["cart/index.html", "order-summary/index.html"]) {
  const h = fs.readFileSync(path.join(D, rel), "utf8");
  console.log(`${rel}: noindex=${h.includes('name="robots" content="noindex"') ? "OK" : "NON"}`);
}

// 2. sitemap : cart/order-summary exclus, villes et produits présents
const sm0 = fs.readFileSync(path.join(D, "sitemap-0.xml"), "utf8");
const locs = [...sm0.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const inCart = locs.filter((u) => u.includes("/cart") || u.includes("/order-summary"));
const nVilles = locs.filter((u) => /\/miestai\/[a-z-]+\/?$/.test(u)).length;
const nProd = locs.filter((u) => /\/produktis\//.test(u)).length;
const nCat = locs.filter((u) => /\/kategorijos\//.test(u)).length;
console.log(`\nsitemap total: ${locs.length} URLs`);
console.log(`  cart/récap dans le sitemap: ${inCart.length} (doit être 0)`);
console.log(`  villes: ${nVilles} | produit: ${nProd} | catégories+sous: ${nCat}`);

// 3. /miestai/ ItemList 25 villes
const mi = fs.readFileSync(path.join(D, "miestai", "index.html"), "utf8");
const villesItemList = (mi.match(/miestai\/[a-z-]+/g) || []).length;
console.log(`/miestai/ liens villes: ${villesItemList}`);

// 4. og:image partout
const files = [];
(function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name === "index.html") files.push(p); } })(D);
let nOg = 0;
for (const f of files) if (fs.readFileSync(f, "utf8").includes('property="og:image"')) nOg++;
console.log(`og:image sur ${nOg}/${files.length} pages`);