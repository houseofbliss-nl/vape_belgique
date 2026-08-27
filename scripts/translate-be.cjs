// Traduction descriptions produits EN → NL/FR/DE pour vape24be (Belgique).
// Usage : node scripts/translate-be.cjs            (les 3 langues, par défaut)
//         node scripts/translate-be.cjs nl         (une seule langue : nl|fr|de)
// - Clé OpenRouter : ligne qui commence par sk-or-v1- dans Desktop\deploy.txt.
// - Une langue = une passe sur les 2181 descriptions (concurrence + retry + progression).
// - Sorties : src/data/products-{nl,fr,de}.json (description = langue cible, description_en conservée).
// Adapté de translate-descriptions.cjs (pipeline EN→LT éprouvé).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src", "data", "products.json");
const PROGRESS = path.join(__dirname, "translation-progress-be.json");

const MODEL = process.env.MODEL || "google/gemini-2.5-flash-lite";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "1200", 10);
const LIMIT = parseInt(process.env.LIMIT || "0", 10); // 0 = tout

const TARGETS = {
  nl: { out: "products-nl.json", lang: "Dutch (Belgium)" },
  fr: { out: "products-fr.json", lang: "French (Belgium)" },
  de: { out: "products-de.json", lang: "German" },
};

function loadKey() {
  const lines = fs.readFileSync(path.join(process.env.USERPROFILE, "Desktop", "deploy.txt"), "utf8").split(/\r?\n/);
  const key = lines.find((l) => l.trim().startsWith("sk-or-v1-"));
  if (!key) throw new Error("Clé OpenRouter (sk-or-v1-) introuvable dans deploy.txt");
  return key.trim();
}

const arg = process.argv[2] || "all";
const langs = arg === "all" ? ["nl", "fr", "de"] : [arg].filter((l) => TARGETS[l]);
if (langs.length === 0) { console.error("Langue inconnue. Utilisez nl, fr, de ou all."); process.exit(1); }

const KEY = loadKey();
const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const products = Array.isArray(raw) ? raw : raw.products;
console.log(`Produits : ${products.length}`);
console.log(`Cibles : ${langs.join(", ")} | Modèle : ${MODEL} | concurrence ${CONCURRENCY}`);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function translateOne(text, langName) {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: `You are a professional e-commerce translator. Translate product descriptions from English into natural ${langName}. Rules: keep brand names, product names, numbers, units (%, ml, mg, puffs, mAh, watt, etc.) unchanged; use a natural persuasive store tone. Output ONLY the ${langName} translation — no quotes, no markdown, no commentary, no English.` },
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
  // Maps handle → description, par langue (reload depuis les sorties existantes).
  const maps = {};
  let state = { done: {} };
  if (fs.existsSync(PROGRESS)) { try { state = JSON.parse(fs.readFileSync(PROGRESS, "utf8")); } catch {} }
  for (const lang of langs) {
    const OUT = path.join(ROOT, "src", "data", TARGETS[lang].out);
    maps[lang] = { map: new Map(), out: OUT, done: new Set(state.done?.[lang] || []) };
    if (fs.existsSync(OUT)) {
      try {
        const prev = JSON.parse(fs.readFileSync(OUT, "utf8"));
        const arr = Array.isArray(prev) ? prev : (prev.products || []);
        for (const p of arr) if (p.description_en) { maps[lang].map.set(p.handle, p.description); maps[lang].done.add(p.handle); }
      } catch {}
    }
  }

  const pending = products.filter((p) => (p.description_en || "").replace(/\s+/g, " ").trim().length > 0);
  const workList = LIMIT > 0 ? pending.slice(0, LIMIT) : pending;
  // Produits à traiter : ceux pour qui au moins une langue cible manque.
  const todos = workList.filter((p) => langs.some((l) => !maps[l].map.has(p.handle) && !maps[l].done.has(p.handle)));
  console.log(`Descriptions à traduire (toutes langues) : ${todos.length}${LIMIT > 0 ? ` (LIMIT=${LIMIT})` : ""}`);

  function saveState() {
    const done = {};
    for (const lang of langs) done[lang] = [...new Set([...maps[lang].done])];
    fs.writeFileSync(PROGRESS, JSON.stringify({ done }), "utf8");
  }

  let ok = 0, fail = 0, idx = 0;
  const maxRetries = 3;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= todos.length) return;
      const p = todos[i];
      const text = (p.description_en || "").replace(/\s+/g, " ").trim();
      // Traduit seulement les langues manquantes pour ce produit.
      const missing = langs.filter((l) => !maps[l].map.has(p.handle) && !maps[l].done.has(p.handle));
      if (missing.length === 0) continue;
      try {
        for (const lang of missing) {
          const t = await translateOne(text, TARGETS[lang].lang);
          maps[lang].map.set(p.handle, t);
          maps[lang].done.add(p.handle);
        }
        ok++;
      } catch (e) {
        // Retries pour chaque langue échouée (translation set before any had?) — on ne marque que si toutes OK.
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            for (const lang of missing) {
              if (maps[lang].map.has(p.handle)) continue;
              const res = await translateOne(text, TARGETS[lang].lang);
              maps[lang].map.set(p.handle, res);
              maps[lang].done.add(p.handle);
            }
            ok++;
            break;
          } catch (e2) {
            if (attempt === maxRetries) { fail++; console.error(`ÉCHEC ${p.handle} : ${e2.message}`); }
            else { const wait = 1500 * attempt + Math.floor(Math.random() * 1000); console.warn(`  retry ${attempt}/${maxRetries} ${p.handle} dans ${wait}ms`); await sleep(wait); }
          }
        }
      }
      if ((ok + fail) % 25 === 0) saveState();
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  saveState();

  for (const lang of langs) {
    const m = maps[lang];
    const out = products.map((p) => {
      const t = m.map.get(p.handle);
      // description = langue cible ; description_en = source EN (déjà présente dans products.json).
      if (t) return { ...p, description: t, description_en: p.description_en || p.description };
      return p;
    });
    const output = Array.isArray(raw) ? out : { ...raw, products: out };
    fs.writeFileSync(m.out, JSON.stringify(output, null, 2), "utf8");
    console.log(`${lang} : ${ok} OK, ${fail} échecs → ${m.out}`);
  }
  console.log(`\nTerminé. Progression : ${PROGRESS}`);
}

run().catch((e) => { console.error("Erreur fatale :", e); process.exit(1); });