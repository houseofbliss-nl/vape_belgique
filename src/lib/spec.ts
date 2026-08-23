// Spécs dérivées de la description produit (puffs/ml/mg/mah...) — partagées
// entre ProductCard (cartes) et slim-catalog (panier/my-list).
// DÉDOUBLONNE les motifs répétés (ex : « 10000 puffs » présent 2× dans la
// description) et limite la sortie à 2 éléments uniques.
const SPEC_RE = /(\d[\d,.]*\s*(puffs|ml|mg|mah|mg\/ml|ml|w|v|mm|g|hg|hz|nm|ohm|Ω|%|µg|µl))\b/gi;

export function deriveSpec(desc: string | undefined | null): string {
  if (!desc) return "";
  const matches = desc.match(SPEC_RE) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of matches) {
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length === 2) break;
  }
  return out.join(", ");
}