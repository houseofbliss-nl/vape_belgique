// Message Telegram de commande — porté de vapespot en EUROS + LITUANIEN.
// Paiement via crypto → remise (CRYPTO_DISCOUNT_PERCENT).
import type { ListItem, Product } from "./types";
import { CRYPTO_DISCOUNT_PERCENT, PACK_TIERS, packPrice } from "./packs";
import { cryptoDiscounted } from "./checkout";

export const TELEGRAM_HANDLE = "Vapelt_shop";

export interface OrderLine {
  product: Product;
  quantity: number;
}

export function buildOrderLines(items: ListItem[], products: Product[]): OrderLine[] {
  return items
    .map((i) => {
      const product = products.find((p) => p.id === i.productId);
      return product ? { product, quantity: i.quantity } : null;
    })
    .filter((x): x is OrderLine => x !== null);
}

export function lineTotal(line: OrderLine): number {
  return packPrice(line.product.price_eur, line.quantity) ?? 0;
}

export function ordersTotal(lines: OrderLine[]): number {
  return lines.reduce((s, l) => s + lineTotal(l), 0);
}

function fmt(p: number | null | undefined): string {
  if (p == null) return "Kaina pagal užklausą";
  return `${p.toFixed(2).replace(".", ",")} €`;
}

export function buildTelegramMessage(
  lines: OrderLine[],
  deliveryAddress = "",
  deliveryMethod: "courier" | "post" = "courier"
): string {
  if (lines.length === 0) {
    return "Sveiki! Norėčiau užsisakyti VAPELT parduotuvėje.";
  }

  const date = new Date().toLocaleDateString("lt-LT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const divider = "─────────────────────────";

  const header = `🛒  NAUJAS UŽSAKYMAS — VAPELT\n📅  ${date}`;

  const productLines = lines
    .map((l, i) => {
      const totalNum = lineTotal(l);
      const total = l.product.price_eur == null ? "—" : fmt(totalNum);
      const effUnit =
        l.quantity > 0 && l.product.price_eur != null ? totalNum / l.quantity : l.product.price_eur;
      const unit = l.product.price_eur == null ? "Kaina pagal užklausą" : fmt(effUnit);
      const isPack = PACK_TIERS.some((t) => t.qty === l.quantity);
      return `${i + 1}. ${l.product.title}\n     ${unit} × ${l.quantity} = ${total}${isPack ? "  (paketas iš " + l.quantity + ")" : ""}`;
    })
    .join("\n\n");

  const totalLine = `IŠ VISO:  ${fmt(ordersTotal(lines))}`;

  const addressSection = deliveryAddress.trim()
    ? `🚚  PRISTATYMO ADRESAS\n\n    ${deliveryAddress.trim()}`
    : `🚚  PRISTATYMO ADRESAS\n\n    Nenurodytas`;

  const deliveryMethodSection =
    deliveryMethod === "courier"
      ? ["🛵  PRISTATYMO BŪDAS", "    Kurjeriu — paprastai 30 min–2 val. iki durų.", "    (Arba paštu, jei pageidaujama.)"].join("\n")
      : ["📮  PRISTATYMO BŪDAS", "    Lietuvos paštu — 1–3 darbo dienos."].join("\n");

  const total = ordersTotal(lines);
  const cryptoTotal = cryptoDiscounted(total);
  const payment = [
    "💳  APMOKĖJIMAS",
    `    Bankiniu pavedimu :  ${fmt(total)}`,
    `    Kriptovaliuta :      ${fmt(cryptoTotal)}  (sutaupote ${CRYPTO_DISCOUNT_PERCENT}%)`,
    "    Apmokėjimas reikalingas prieš pristatymą.",
  ].join("\n");

  const footer = "Prašome atsakyti, kad patvirtintumėte užsakymą. Ačiū! 🙏";

  return [
    header,
    divider,
    "📦  UŽSAKYMAS\n",
    productLines,
    divider,
    totalLine,
    divider,
    addressSection,
    divider,
    deliveryMethodSection,
    divider,
    payment,
    divider,
    footer,
  ].join("\n");
}

export function buildTelegramUrl(message: string, handle = TELEGRAM_HANDLE): string {
  return `https://t.me/${handle}?text=${encodeURIComponent(message)}`;
}