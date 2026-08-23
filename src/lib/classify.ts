// Classification du catalogue vapesale24 en categories + sous-categories.
// Racines : Vienkartiniai (disposables), E-sultys (liquids),
//           Nikotino pagalveles (pouches), Prietaisai (kits/mods/pods).
// Corrige le 22/08 : les disposables "900mAh" (Monster Bar Mini 800, Hyde Color
// Recharge) tombaient dans E-sultys car leur description contient "juice".
// Nouvel ordre de detection :
//   1. pouches (incl. mai(su sherbet)el)
//   2. bouteille e-liqu par TITRE (mot e-liqu + volume "ml")
//   3. disposable par TITRE (chiffres K, "puffs", code 4-7)
//   3.5 kit-appareil par TITRE (kit/rinkin/komplekt)
//   4. dispositif/disposable par DESCRIPTION (mAh, rechargeable, X puffs, prefilled)
//   5. e-liqu par description   6. appareils (titre)   7. defaut = disposable

export type CatKey = "vienkartiniai" | "esultys" | "nicotine-pouches" | "priedai";

const clean = (s: string): string => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export interface Classified {
  cat: CatKey;
  sub: string;
}

// ---- signaux ----

// Bouteille d'e-juice reconnue par le TITRE : mot e-liquide + un volume "ml"
// ("drusk" = nikotino druskos, sels nicotiniens lituaniens).
const BOTTLE_TITLE_RE =
  /\b(e-?liquid|e-?juice|nic ?salt|salt ?nic|nic ?shot|shortfill|freebase)\b|drusk/i;
const BOTTLE_ML_RE = /\b\d{1,3}\s*ml\b/;

// Marqueur "disposable" dans le titre : "50K / 10000 puffs / 6000", code 4-7 chiffres.
const K_PUFFS_RE = /\d{1,6}\s?k\b|\d{3,6}\s*puffs?\b|\b(disposable|refillable)\b/i;
const DIGITS47_RE = /\d{4,7}/;

// Kit-APPAREIL dans le titre. "rinkin"/"komplekt" sans \b final (suffixes lituaniens).
const KIT_WORDS_RE = /\b(kit|starter|bundle)\b|rinkin|komplekt/i;

// Signaux forts de dispositif/disposable lus dans la description (avant e-liqu).
// Une vraie e-liquide peut ecrire "every puff" ou "low-wattage devices" : on ne garde
// que des motifs impossibles dans le texte d'une bouteille.
const DEV_DESC_RE =
  /\b\d{1,4}\s*mah\b|built-?in\s*(battery|batterij)|internal\s*(battery|batterij)|\brecharg\w*\b|\bdisposable\b|\d{2,7}\s*puffs?\b|draw-?activated|auto-?draw|pre-?fill(ed|ing)?|straight out of the box/i;

// ---- 1) pouches ----

function pouchSub(blob: string): string {
  const mm = blob.match(/\b(\d{1,2})\s*mg\b/);
  const mg = mm ? parseInt(mm[1], 10) : 0;
  if (mg <= 6) return "iki-6mg";
  if (mg <= 12) return "7-12mg";
  return "13mg-plus";
}

// ---- e-liquids ----

function eLiquidSub(blob: string, tags: string[]): string {
  if (tags.some((t) => t.includes("shortfill")) || /\bshortfill\b/.test(blob)) return "shortfill";
  if (tags.some((t) => t.includes("freebase")) || /\bfreebase\b/.test(blob)) return "freebase";

  const mgM = blob.match(/\b(\d{1,2})\s*mg\b/);
  const mg = mgM ? parseInt(mgM[1], 10) : 0;
  if (mg === 20) return "20mg";
  if (mg === 10) return "10mg";
  if (mg === 6) return "6mg";
  if (mg === 5) return "5mg";
  if (mg === 3) return "3mg";
  if (mg === 0 || /\bno ?nicotine|nicotine.?free|\b0 ?mg\b/.test(blob)) return "0mg";

  const sizeM = blob.match(/\b(\d{2,3})\s*ml\b/);
  const size = sizeM ? parseInt(sizeM[1], 10) : 0;
  if (size >= 100) return "100ml";
  if (size >= 60) return "60ml";
  if (size >= 30) return "30ml";
  return "10ml";
}

function eLiquidSignals(blob: string, tags: string[]): boolean {
  if (
    /\be-?liquid\b|\be-?juice\b|vapo ?jugje|nic ?salt|salt ?nic|\bsaltnic\b|nic ?shot|shortfill|freebase|vape ?juice|vape ?sauce|\bjuice\b|drusk/i.test(
      blob,
    )
  )
    return true;
  return tags.some(
    (t) =>
      ["e-liquid", "vape juice", "nic salt", "nic-salt", "nic shot", "e-juice", "salt nic", "shortfill", "freebase", "juice"].includes(t) ||
      (/\bml\b/.test(t) && /juice|salt|shot|e.?liquid/.test(t)),
  );
}

// ---- disposables / puffs ----

function puffsSub(title: string, blob: string, raw: string): string {
  const nums: number[] = [];

  // "50K", "10k", "150K" (K accole au chiffre)
  for (const mm of blob.matchAll(/(\d{1,6})\s*[kK]\b/g)) {
    nums.push(parseFloat(mm[1]) * 1000);
  }

  // "40,000 puffs", "10000 puffs"
  for (const mm of raw.matchAll(/(\d{1,3})[,.](\d{3})\s*puffs?\b|[^k](\d{3,7})\s*puffs?\b/gi)) {
    if (mm[1] && mm[2]) nums.push(parseFloat(mm[1] + mm[2]));
    else if (mm[3]) nums.push(parseFloat(mm[3]));
  }

  // code modele 4-7 dans le titre
  if (nums.length === 0) {
    for (const mm of title.matchAll(/\d{4,7}/g)) {
      const v = parseInt(mm[0], 10);
      if (v >= 1000 && v <= 999999 && !/^20\d\d$/.test(String(v))) nums.push(v);
    }
  }

  // code modele 4-7 dans le blob
  if (nums.length === 0) {
    for (const mm of raw.matchAll(/(^|[^\d])(\d{4,7})(?:[^\d.]|$)/g)) {
      const v = parseInt(mm[2], 10);
      if (v >= 1000 && v <= 999999 && !/^(19|20)\d\d$/.test(String(v))) nums.push(v);
    }
  }

  const n = nums.length ? Math.max(...nums) : 0;
  if (n >= 50000) return "50k-plus";
  if (n >= 30000) return "30-50k";
  if (n >= 20000) return "20-30k";
  if (n >= 10000) return "10-20k";
  if (n >= 1000 || nums.length) return "iki-10k";
  return "kita";
}

// ---- appareils (sous-cats) ----

function deviceSub(title: string, tags: string[]): string | null {
  if (/\b(kit|start ?kit|starter)\b/.test(title)) return "kits";
  if (/\bcoil|atomizer|\brda\b|\brta\b|\brba\b/.test(title)) return "seliai";
  if (/\bmod\b|box ?mod|vape ?mod/.test(title)) return "modai";
  if (/\bbater(ij|y|ia)|18650|21700/.test(title) || /\bcharger/.test(title)) return "baterijos";
  if (/\bpod\b|\bpodai\b/.test(title + " " + (tags || []).join(" "))) return "poda";
  if (/\btank\b|sub-?ohm|\bbakas\b/.test(title)) return "talpos";
  if (/\bdrip-?tip\b|mouth-?piece|sleeve|cleaning|brush|sticker|skin|\breplacement\b/.test(title)) return "aksesuarai";
  return null;
}

export function classify(p: {
  title: string;
  description?: string;
  tags?: string[];
  vendor?: string;
}): Classified {
  const title = clean(p.title || "");
  const blob = clean(`${p.title || ""} ${p.description || ""} ${(p.tags || []).join(" ")}`);
  const raw = `${p.title || ""} ${p.description || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
  const titleLower = (p.title || "").toLowerCase();
  const tags = (p.tags || []).map((t) => t.toLowerCase());

  // 1. plaques (nikotino pagalveles) — signal net, incl. "mai(su sherbet)el" lituanien
  if (tags.some((t) => t.includes("pouch")) || /\bpouch\b|nicopod|maišel/.test(blob)) {
    return { cat: "nicotine-pouches", sub: pouchSub(blob) };
  }

  // 2. Bouteille d'e-liquide par le TITRE (mot e-liqu + volume "ml")
  if (BOTTLE_TITLE_RE.test(titleLower) && BOTTLE_ML_RE.test(titleLower)) {
    return { cat: "esultys", sub: eLiquidSub(blob, tags) };
  }

  // 3. Disposable par le TITRE ("50K", "10000 puffs", "FC40000", "disposable")
  if (K_PUFFS_RE.test(titleLower) || DIGITS47_RE.test(titleLower)) {
    return { cat: "vienkartiniai", sub: puffsSub(title, blob, raw) };
  }

  // 3.5 Kit-APPAREIL par le TITRE ("Uwell V6 Kit", "Voopoo Argus 25W rinkinys")
  if (KIT_WORDS_RE.test(titleLower)) {
    return { cat: "priedai", sub: "kits" };
  }

  // 4. Dispositif / disposable par la DESCRIPTION (signaux forts)
  if (DEV_DESC_RE.test(raw)) {
    return { cat: "vienkartiniai", sub: puffsSub(titleLower, blob, raw) };
  }

  // 5. E-liquide (description)
  if (eLiquidSignals(blob, tags)) {
    return { cat: "esultys", sub: eLiquidSub(blob, tags) };
  }

  // 6. Appareils / accessoires par le TITRE
  const d = deviceSub(title, tags);
  if (d) return { cat: "priedai", sub: d };

  // 7. Defaut -> disposable
  return { cat: "vienkartiniai", sub: puffsSub(titleLower, blob, raw) };
}

// ---- ordre + libelles ----

export const SUBS_ORDER: Record<CatKey, string[]> = {
  vienkartiniai: ["iki-10k", "10-20k", "20-30k", "30-50k", "50k-plus", "kita"],
  esultys: ["0mg", "3mg", "5mg", "6mg", "10mg", "20mg", "10ml", "30ml", "60ml", "100ml", "shortfill", "freebase"],
  "nicotine-pouches": ["iki-6mg", "7-12mg", "13mg-plus"],
  priedai: ["kits", "modai", "poda", "talpos", "seliai", "baterijos", "aksesuarai", "kita"],
};

export const SUBS_LABELS: Record<string, string> = {
  "iki-10k": "Iki 10 000 puffs",
  "10-20k": "10 000-20 000 puffs",
  "20-30k": "20 000-30 000 puffs",
  "30-50k": "30 000-50 000 puffs",
  "50k-plus": "50 000+ puffs",
  kita: "Kita",
  "0mg": "0 mg",
  "3mg": "3 mg",
  "5mg": "5 mg",
  "6mg": "6 mg",
  "10mg": "10 mg",
  "20mg": "20 mg",
  "10ml": "Iki 30 ml",
  "30ml": "30 ml",
  "60ml": "60 ml",
  "100ml": "100 ml +",
  shortfill: "Shortfill",
  freebase: "Freebase",
  "iki-6mg": "Iki 6 mg",
  "7-12mg": "7-12 mg",
  "13mg-plus": "13 mg +",
  kits: "Kits",
  modai: "Modai",
  poda: "Podai",
  talpos: "Talpos & stiklas",
  seliai: "Seličiai & atomizatorių",
  baterijos: "Baterijos ir įkrovikliai",
  aksesuarai: "Aksesuarai",
};

export const CAT_LABELS: Record<CatKey, string> = {
  vienkartiniai: "Vienkartiniai",
  esultys: "E-sultys",
  "nicotine-pouches": "Nikotino pagalvėlės",
  priedai: "Prietaisai",
};