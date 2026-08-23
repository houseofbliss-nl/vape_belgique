// Smoke test du site déployé : accueil, produit LT, ville, sitemap, robots, fichier vérification.
const urls = [
  ["accueil", "https://vapelt.dealsnows.com/"],
  ["produit LT", "https://vapelt.dealsnows.com/produktis/ijoy-xp100k-pod-texas-compliant/"],
  ["ville Vilnius", "https://vapelt.dealsnows.com/miestai/vilnius/"],
  ["miestai index", "https://vapelt.dealsnows.com/miestai/"],
  ["sitemap-index", "https://vapelt.dealsnows.com/sitemap-index.xml"],
  ["robots.txt", "https://vapelt.dealsnows.com/robots.txt"],
  ["404.html", "https://vapelt.dealsnows.com/404.html"],
  ["vérification GSC", "https://vapelt.dealsnows.com/google1f25e87e92a21406.html"],
];
(async () => {
  for (const [label, url] of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const body = await res.text();
      let extra = "";
      if (label === "accueil") extra = body.includes("VAPELT") ? " | contient VAPELT: oui" : "";
      if (label === "produit LT") extra = body.includes("Susipažinkite su iJoy") ? " | description LT: oui" : (body.toLowerCase().includes("lithuanian") ? "" : " | (desc?)");
      if (label === "ville Vilnius") extra = body.includes("Vapingo pristatymas Vilnius") ? " | h1 Viola: oui" : "";
      if (label === "sitemap-index") extra = body.includes("sitemap-0.xml") ? " | refs sitemap-0: oui" : "";
      console.log(`${res.status === 200 ? "✅" : "⚠️"} ${label}: ${res.status}${extra}`);
    } catch (e) {
      console.log(`�❗ ${label}: ERREUR ${e.message}`);
    }
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });