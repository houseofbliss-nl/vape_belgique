// Affiche le contenu textuel du bloc principal d'une page ville rendue.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "dist", "miestai", "vilnius", "index.html"), "utf8");
const main = html.match(/<div class="mx-auto max-w-6xl px-4 py-8">([\s\S]*?)<\/div>\s*<AddToCart|<div class="mx-auto max-w-6xl px-4 py-8">([\s\S]*)/);
const body = (main?.[1] || main?.[2] || "");
// nettoie scripts inline
let clean = body.replace(/<script[\s\S]*?<\/script>/g, "");

function show(tag) {
  const out = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  let m;
  while ((m = re.exec(clean))) {
    const t = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (t && !t.startsWith("Ieškoti") && !t.startsWith("Mano")) out.push(t);
  }
  return out;
}
console.log("=== Contenu principal de /miestai/vilnius ===\n");
console.log("— H1 —\n" + show("h1").join("\n"));
console.log("\n— Sections H2 —\n" + show("h2").join("\n"));
console.log("\n— Paragraphes —\n" + show("p").slice(0, 4).join("\n"));
console.log("\n— FAQ (titres + réponses) —\n" + clean.match(/<p class="font-semibold[^>]*>([\s\S]*?)<\/p>/g)?.join("\n"));
console.log("\n— Bouton CTA texte —");
const btns = clean.match(/<a[^>]*class="[^"]*bg-primary[^"]*"[^>]*>([\s\S]*?)<\/a>/);
console.log(btns ? btns[1].replace(/<[^>]+>/g, "").trim() : "n/a");
console.log("\n— Villes liées (valeurs) —");
const cities = clean.match(/href="\/miestai\/[a-z-]+\/[^"]*"[^>]*>([^<]+)<\/a>/g);
console.log((cities || []).map((c) => c.replace(/.*>([^<]+)<\/a>/, "$1")).join(", "));