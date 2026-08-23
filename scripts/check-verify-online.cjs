// Vérifie la disponibilité du fichier de vérification sur le site déployé.
const path = "https://vapelt.dealsnows.com/google1f25e87e92a21406.html";
(async () => {
  for (let i = 1; i <= 8; i++) {
    try {
      const res = await fetch(path, { signal: AbortSignal.timeout(15000) });
      const txt = await res.text();
      const ok = txt.trim() === "google-site-verification: google1f25e87e92a21406.html";
      console.log(`tentative ${i}: HTTP ${res.status} | contenu correct: ${ok}`);
      if (res.ok && ok) { console.log("✅ Fichier accessible — validate la propriété dans Search Console maintenant."); process.exit(0); }
    } catch (e) {
      console.log(`tentative ${i}: erreur ${e.message}`);
    }
    if (i < 8) await new Promise((r) => setTimeout(r, 15000));
  }
  console.log("Toujours pas 200 après 8 tentatives (~2 min) — Cloudflare peut mettre plus de temps à redéployer.");
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });