// Télécharge 4 photos produits (représentatives des 4 catégories) vers public/images/cat/
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const P = raw.products || raw; // { id, title, image, ... }
const picks = [
  ["geekbar-mate.png", "Geek Bar MATE 60K KIT"],
  ["vgod-saltnic.png", "VGOD SaltNic E-Liquid 30ml"],
  ["voopoo-argus.png", "Voopoo Argus G2 30W rinkinys"],
  ["velo-pouches.png", "Velo Ultra Strength 17mg ploni nikotino maišeliai – 20 vnt"],
];

for (const [name, ttl] of picks) {
  const p = P.find((x) => x.title === ttl);
  if (!p) { console.log("MISS:", ttl); continue; }
  const url = p.image.split("?")[0] + "?width=800&height=800&crop=center";
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const b = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync("public/images/cat/" + name, b);
    console.log("OK", name, "bytes=" + b.length, "type=" + (r.headers.get("content-type") || "?"));
  } catch (e) {
    console.log("ERR", name, e.message || e);
  }
}