// Traduction des descriptions produits EN → LT via OpenRouter (Gemini 2.5 Flash-Lite)
// Usage : node scripts/translate-descriptions.cjs
// - Clé OpenRouter lue ligne 1 de Desktop\deploy.txt (jamais en dur)
// - Traduit chaque description individuellement (fiabilité parsing), avec concurrence BATCH
// - Progression : scripts/translation-progress.json (handles traités) → reprend où on s'est arrêté
// - Sortie : src/data/products-lt.json (même structure, description = LT, description_en conservée)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src", "data", "products.json");
const OUT = path.join(ROOT, "src", "data", "products-lt.json");
const STATE = path.join(__dirname, "translation-progress.json");

const MODEL = process.env.MODEL || "google/gemini-2.5-flash-lite";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "1200", 10);
const LIMIT = parseInt(process.env.LIMIT || "0", 10); // 0 = tout, sinon nombre max de nouveaux produits

function loadKey() {
  const deploy = path.join(process.env.USERPROFILE, "Desktop", "deploy.txt");
  const content = fs.readFileSync(deploy, "utf8");
  const first = content.split(/\r?\n/)[0].trim();
  if (!first.startsWith("sk-or-v1-")) throw new Error("Clé introuvable en ligne 1 de deploy.txt");
  return first;
}

const KEY = loadKey();
const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const products = Array.isArray(raw) ? raw : raw.products;
console.log(`Produits : ${products.length}`);
console.log(`Modèle : ${MODEL} | concurrence ${CONCURRENCY}`);

let progress = { done: [] };
if (fs.existsSync(STATE)) {
  try { progress = JSON.parse(fs.readFileSync(STATE, "utf8")); } catch {}
}
const doneSet = new Set(progress.done || []);

const translations = new Map(); // handle -> lt
if (fs.existsSync(OUT)) {
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, "utf8"));
    const arr = Array.isArray(prev) ? prev : (prev.products || []);
    for (const p of arr) if (p.description_en) { translations.set(p.handle, p.description); doneSet.add(p.handle); }
  } catch {}
}

function saveState() { fs.writeFileSync(STATE, JSON.stringify({ done: [...doneSet] }), "utf8"); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function translateOne(text) {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: "You are a professional e-commerce translator. Translate product descriptions from English into natural Lithuanian. Rules: keep brand names, product names, numbers, units (%, ml, mg, puffs, mAh, watt, etc.) unchanged; use a natural persuasive store tone. Output ONLY the Lithuanian translation — no quotes, no markdown, no commentary, no English." },
      { role: "user", content: text },
    ],
    temperature: 0.3,
    max_tokens: MAX_TOKENS,
  };
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`);
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 500)}`);
  }
  const data = await res.json();
  const out = (data.choices?.[0]?.message?.content || "").trim();
  if (!out) throw new Error("Réponse vide");
  return out;
}

async function run() {
  const queue = products.filter((p) => !doneSet.has(p.handle));
  const pending = queue.filter((p) => (p.description || "").replace(/\s+/g, " ").trim().length > 0);
  const empty = queue.length - pending.length;
  if (empty > 0) { console.log(`${empty} produits sans description → traités comme faits`); }
  const workList = LIMIT > 0 ? pending.slice(0, LIMIT) : pending;
  console.log(`Descriptions à traduire : ${workList.length}${LIMIT > 0 ? ` (LIMIT=${LIMIT})` : ""}`);

  let ok = 0, fail = 0, idx = 0;
  const maxRetries = 3;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= workList.length) return;
      const p = workList[i];
      const text = p.description.replace(/\s+/g, " ").trim();
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const lt = await translateOne(text);
          translations.set(p.handle, lt);
          doneSet.add(p.handle);
          ok++;
          if (ok % 25 === 0) saveState();
          break;
        } catch (e) {
          if (attempt === maxRetries) {
            fail++;
            console.error(`ÉCHEC ${p.handle} : ${e.message}`);
            doneSet.add(p.handle); // marqué fait pour ne pas boucler — relançable avec STATE supprimé
          } else {
            const wait = 1500 * attempt + Math.floor(Math.random() * 1000);
            console.warn(`  retry ${attempt}/${maxRetries} ${p.handle} (${e.message}) dans ${wait}ms`);
            await sleep(wait);
          }
        }
      }
      if ((ok + fail) % 50 === 0) saveState();
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  saveState();

  // Écriture finale
  const out = products.map((p) => {
    const lt = translations.get(p.handle);
    if (lt) return { ...p, description: lt, description_en: p.description };
    return p; // produit non traduit (pas de desc) reste inchangé avec description d'origine
  });
  const output = Array.isArray(raw) ? out : { ...raw, products: out };
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`\nTerminé : ${ok} traduits, ${fail} échecs.`);
  console.log(`Fichier écrit : ${OUT}`);
}

run().catch((e) => {
  console.error("Erreur fatale :", e);
  process.exit(1);
});