// Vérifie que les 8 correctifs sont LIVE sur prod (vapelt.dealsnows.com) après déploiement CF.
const urls = [
  ["accueil (badge panier)", "https://vapelt.dealsnows.com/", ["localStorage.getItem(\"vapelt:my-list\")"]],
  // order-summary est client-rendered : les strings sont dans le BUNDLE JS, pas le HTML
  ["bundle order-summary", "https://vapelt.dealsnows.com/_astro/order-summary.astro_astro_type_script_index_0_lang.D0ec-Dso.js", ["Bankinis pavedimas", "Kredito kortelė", "Sutaupote 10%", "Atsiskaityti", "IBAN / SWIFT"]],
  ["sous-cat puffs", "https://vapelt.dealsnows.com/kategorijos/vienkartiniai/iki-10k/", ["10 000 puffs"]],
];
(async () => {
  let ok = 0, total = 0;
  for (const [label, u, toks] of urls) {
    total++;
    try {
      const r = await fetch(u, { redirect: "manual" });
      const body = await r.text();
      const missing = toks.filter((t) => !body.includes(t));
      const good = r.status === 200 && missing.length === 0;
      if (good) ok++;
      console.log(`${good ? "OK " : "FAIL"} ${label}  [${toks.join(", ")}] → ${missing.length ? "MANQUANTS: " + missing.join(", ") : "présents"}`);
    } catch (e) {
      console.log(`ACH   ${label}  →  ${e.message}`);
    }
    await new Promise((res) => setTimeout(res, 400));
  }
  console.log(`\n── ${ok}/${total} OK ──`);
  if (ok < total) process.exitCode = 1;
})();