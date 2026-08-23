// Vérifie que les URLs prioritaires à soumettre manuellement répondent 200 sur prod.
// Traite chaque URL individuellement (try/catch) : un timeout ne tue plus le script.
const urls = [
  ["accueil", "https://vapelt.dealsnows.com/"],
  ["catégories (index)", "https://vapelt.dealsnows.com/kategorijos/"],
  ["cat: vienkartiniai", "https://vapelt.dealsnows.com/kategorijos/vienkartiniai/"],
  ["cat: esultys", "https://vapelt.dealsnows.com/kategorijos/esultys/"],
  ["cat: nicotine-pouches", "https://vapelt.dealsnows.com/kategorijos/nicotine-pouches/"],
  ["cat: priedai", "https://vapelt.dealsnows.com/kategorijos/priedai/"],
  ["sous: iki-10k", "https://vapelt.dealsnows.com/kategorijos/vienkartiniai/iki-10k/"],
  ["sous: 10-20k", "https://vapelt.dealsnows.com/kategorijos/vienkartiniai/10-20k/"],
  ["sous: 30-50k", "https://vapelt.dealsnows.com/kategorijos/vienkartiniai/30-50k/"],
  ["sous: 20mg", "https://vapelt.dealsnows.com/kategorijos/esultys/20mg/"],
  ["sous: shortfill", "https://vapelt.dealsnows.com/kategorijos/esultys/shortfill/"],
  ["sous: 7-12mg", "https://vapelt.dealsnows.com/kategorijos/nicotine-pouches/7-12mg/"],
  ["sous: kits", "https://vapelt.dealsnows.com/kategorijos/priedai/kits/"],
  ["miestai index", "https://vapelt.dealsnows.com/miestai/"],
  ["ville: vilnius", "https://vapelt.dealsnows.com/miestai/vilnius/"],
  ["ville: kaunas", "https://vapelt.dealsnows.com/miestai/kaunas/"],
  ["ville: klaipeda", "https://vapelt.dealsnows.com/miestai/klaipeda/"],
  ["ville: siauliai", "https://vapelt.dealsnows.com/miestai/siauliai/"],
  ["ville: panevezys", "https://vapelt.dealsnows.com/miestai/panevezys/"],
  ["produit: ijoy-xp100k", "https://vapelt.dealsnows.com/produktis/ijoy-xp100k-pod-texas-compliant/"],
  ["produit: ebcreate-40k", "https://vapelt.dealsnows.com/produktis/ebcreate-bc-pro-40k-texas-compliant/"],
  ["apie", "https://vapelt.dealsnows.com/apie/"],
  ["zinios", "https://vapelt.dealsnows.com/zinios/"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45000), redirect: "manual" });
    return { status: res.status, ok: res.status === 200 };
  } catch (e) {
    return { status: "ERR " + e.message, ok: false };
  }
}

(async () => {
  let failures = [];
  for (const [label, url] of urls) {
    let r = await check(url);
    // un échec réseau → retente une fois après 2s
    if (!r.ok && String(r.status).startsWith("ERR")) {
      await sleep(2000);
      r = await check(url);
    }
    console.log(`${r.ok ? "OK " : r.status} ${label}  ${url}`);
    if (!r.ok) failures.push([label, url, r.status]);
    await sleep(400); // léger espacement pour éviter la saturation
  }
  console.log("\n── RÉSUMÉ ──");
  console.log(`${urls.length - failures.length}/${urls.length} OK`);
  if (failures.length) {
    console.log("ÉCHECS :");
    for (const [label, url, status] of failures) console.log(`  ${status} ${label}  ${url}`);
  } else {
    console.log("Toutes les URLs prioritaires répondent 200 ✅");
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });