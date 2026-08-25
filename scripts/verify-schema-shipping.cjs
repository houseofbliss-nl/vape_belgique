// Vérifie que shippingDetails + hasMerchantReturnPolicy + pas de review inventé
// sont présents dans le JSON-LD des pages produit générées.
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const handles = [
  "ijoy-xp100k-pod-texas-compliant",
  "ebcreate-bc-pro-40k-texas-compliant",
  "georgia-peach-raz-ca6000-zero-nicotine",
];

function readProduct(handle) {
  const p = path.join(DIST, "produktis", handle, "index.html");
  return fs.readFileSync(p, "utf8");
}

let ok = 0, total = 0;
function t(label, cond, detail) { total++; if (cond) ok++; console.log(`${cond ? "OK  " : "FAIL"} ${label}${detail ? "  → " + detail : ""}`); return cond; }

for (const h of handles) {
  console.log(`\n── produit: ${h}`);
  const html = readProduct(h);
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const productSchema = ldBlocks
    .map((b) => { try { return JSON.parse(b); } catch { return null; } })
    .find((o) => o && o["@type"] === "Product");
  if (!productSchema) { t("schéma Product présent", false, "introuvable"); continue; }
  const offers = productSchema.offers;
  t("offers présent", !!offers);
  t("shippingDetails présent", !!(offers && offers.shippingDetails));
  if (offers && offers.shippingDetails) {
    const sd = offers.shippingDetails;
    t("  shippingRate = 0 EUR", sd.shippingRate && sd.shippingRate.value === "0" && sd.shippingRate.currency === "EUR");
    t("  shippingDestination LT", sd.shippingDestination && sd.shippingDestination.addressCountry === "LT");
    t("  deliveryTime transitTime max 2h", sd.deliveryTime && sd.deliveryTime.transitTime && sd.deliveryTime.transitTime.unitCode === "HUR");
  }
  t("hasMerchantReturnPolicy présent", !!(offers && offers.hasMerchantReturnPolicy));
  if (offers && offers.hasMerchantReturnPolicy) {
    const rp = offers.hasMerchantReturnPolicy;
    t("  category MerchantReturnNotPermitted", rp.returnPolicyCategory === "https://schema.org/MerchantReturnNotPermitted");
    t("  applicableCountry LT", rp.applicableCountry === "LT");
  }
  t("AUCUN review inventé (product)", !productSchema.review, productSchema.review ? "review trouvé !" : "");
  t("AUCUN aggregateRating inventé", !productSchema.aggregateRating, productSchema.aggregateRating ? "aggregateRating trouvé !" : "");
}

console.log(`\n── ${ok}/${total} contrôles OK ──`);
if (ok < total) process.exitCode = 1;