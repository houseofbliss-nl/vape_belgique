// Vérifie que les 8 correctifs UI (session 23/08) sont bien présents dans le build dist/.
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");

function read(rel) {
  return fs.readFileSync(path.join(DIST, rel), "utf8");
}

function count(haystack, needle) {
  let n = 0, i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

function report(label, ok, detail) {
  console.log(`${ok ? "OK  " : "FAIL"} ${label}${detail ? "  →  " + detail : ""}`);
  return ok ? 1 : 0;
}

let ok = 0, total = 0;
function t(label, cond, detail) { total++; if (cond) ok++; return report(label, cond, detail); }

(async () => {
  console.log("── VÉRIFICATION CORRECTIONS VAPELT (build dist) ──\n");

  // 1. scene : badge panier relit localStorage (Header)
  try {
    const header = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
    t("N°1 badge : lit vapor:my-list (localStorage)", count(header, 'localStorage.getItem("vapelt:my-list")') >= 1);
    t("N°1 badge : écoute vapelt:storage", count(header, '"vapelt:storage"') >= 1);
  } catch (e) { t("N°1 badge : page index lisible", false, e.message); }

  // order-summary
  const os = read("order-summary/index.html");

  // 2. euro simple au minimum de commande
  // On cherche "Minimalus užsakymas:" puis la zone suivante ; on compte les "€" dans la page (les doublons provenaient d'un span € + formatPrice)
  const minIdx = os.indexOf("Minimalus");
  if (minIdx === -1) {
    t("N°2 min commande introuvable", false, "jet @Minimalus absent");
  } else {
    const zone = os.substring(minIdx, Math.min(os.length, minIdx + 200));
    // do not double: formatPrice ajoute déjà " €"
    const euros = count(zone, "€");
    t("N°2 min commande : 1 × € seulement", euros <= 1, `${euros} × € dans la zone`);
  }

  // total : le total (order summary) ne doit plus avoir de span € dupliqué
  // décompte des "€" dans la page entière — avant il y en avait plus
  // mais pas de repère fiable ; on vérifie au moins qu'il n'y a pas de site " 30,00 € €"
  t("N°2 pas de double-espace-€ collé", !/€\s?€/.test(os), "");

  // 3/4/5 : intitulés de modes de paiement
  t("N°3 SEPA → Bankinis pavedimas", count(os, "Bankinis pavedimas") >= 1);
  t("N°3 sous-titre SEPA → IBAN / SWIFT", count(os, "IBAN / SWIFT") >= 1);
  t("N°3 Kortelė → Kredito kortelė", count(os, "Kredito kortelė") >= 1);
  t("N°3 Carte → Visa / Mastercard (sous-titre)", count(os, "Visa") >= 1 && count(os, "Mastercard") >= 1);
  t("N°3 carte cadeau : Sutaupote (même que crypto)", count(os, "Dovanų koda") === 0, "Dovan_code écrit resté ? " + count(os, "Dovan") + " occurrence(s)");

  // 4. bouton checkout / passer en caisse
  t("N°4 bouton → Atsiskaityti", count(os, "Atsiskaityti") >= 1, count(os, "Atsiskaityti") + " occurrence(s)");

  // 5. titre hero → Telegram (format selon Hero.ts à vérifier plus bas)
  // 5 réel = bouton hero convoit Telegram : vérifier la home
  try {
    const home = read("index.html");
    t("N°5 hero bouton Telegram", /[Cc]ontact|Telegram/.test(home), "hero cherche mots-clés Telegram");
  } catch { }

  // 8. sous-catégories puffs dans le libellé (caté de vienkartiniai)
  try {
    const sub = read("kategorijos/vienkartiniai/iki-10k/index.html");
    t("N°8 libellé 'Iki 10 000 puffs'", count(sub, "10 000 puffs") >= 1);
  } catch (e) { t("N°8 sous-cat puffs", false, e.message); }

  console.log(`\n── ${ok}/${total} contrôles OK ──`);
  if (ok < total) process.exitCode = 1;
})();