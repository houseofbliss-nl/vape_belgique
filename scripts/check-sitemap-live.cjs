// Compte les URLs du sitemap déployé + vérifie la référence sitemap-index.
(async () => {
  const idx = await (await fetch("https://vapelt.dealsnows.com/sitemap-index.xml")).text();
  const refs = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log("sitemap-index refs:", refs.join(", "));
  for (const ref of refs) {
    const body = await (await fetch(ref)).text();
    const n = (body.match(/<loc>/g) || []).length;
    const villes = (body.match(/\/miestai\/[a-z-]+\/<\/loc>/g) || []).length;
    console.log(`  ${ref} → ${n} URLs (dont ${villes} villes)`);
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });