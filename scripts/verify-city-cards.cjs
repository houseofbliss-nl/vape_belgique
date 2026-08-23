// Compte les liens produits + vérifie la grille sur une page ville.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "dist", "miestai", "vilnius", "index.html"), "utf8");
const links = html.match(/href="\/produktis\/[^"]+"/g) || [];
const unique = [...new Set(links)];
console.log("liens produits:", unique.length);
console.log("exemple:", unique.slice(0, 3));
const price = (html.match(/€/g) || []).length;
console.log("occurrences '€' (prix):", price);