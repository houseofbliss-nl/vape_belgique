// Vérifie N°2 (min commande = 1 seul €, pas de doublon) sur le bundle déployé.
(async () => {
  const BUNDLE = "https://vapelt.dealsnows.com/_astro/order-summary.astro_astro_type_script_index_0_lang.D0ec-Dso.js";
  const body = await (await fetch(BUNDLE, { redirect: "manual" })).text();
  const i = body.indexOf("Minimalus užsakymas");
  if (i === -1) { console.log("N°2 : 'Minimalus užsakymas' introuvable"); process.exit(1); }
  const zone = body.substring(i, Math.min(body.length, i + 220));
  const euros = (zone.match(/€/g) || []).length;
  console.log("N°2 zone:", JSON.stringify(zone.slice(0, 90)));
  console.log("N°2 nb de € dans la zone :", euros, euros > 1 ? "(DOUBLON!)" : "(OK, 1x)");
  console.log("N°2 double-€ collé :", /€\s?€/.test(body) ? "PRÉSENT!" : "aucun");
  process.exitCode = euros > 1 || /€\s?€/.test(body) ? 1 : 0;
})();