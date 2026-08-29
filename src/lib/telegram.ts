// Message Telegram de commande — EUROS + langue courante détectée au runtime
// (NL/FR/DE via à l'URL). Paiement via crypto → remise (CRYPTO_DISCOUNT_PERCENT).
import type { ListItem, Product } from "./types";
import { CRYPTO_DISCOUNT_PERCENT, PACK_TIERS, packPrice } from "./packs";
import { cryptoDiscounted } from "./checkout";
import { detectLang, tRuntime, fmtEur } from "./i18n-client";

export const TELEGRAM_HANDLE = "Vapelt_shop";
export const SITE_NAME_TG = "vape24be";

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
  if (p == null) return tRuntime("product.priceRequest");
  return `${p.toFixed(2).replace(".", ",")} €`;
}

export function buildTelegramMessage(
  lines: OrderLine[],
  deliveryAddress = "",
  deliveryMethod: "courier" | "post" = "courier"
): string {
  const lang = detectLang();
  if (lines.length === 0) {
    return tRuntime("tg.greeting", { name: SITE_NAME_TG });
  }

  const date = new Date().toLocaleDateString(
    lang === "fr" ? "fr-BE" : lang === "de" ? "de-BE" : "nl-BE",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  const divider = "─────────────────────────";

  const header = `${tRuntime("tg.newOrder", { name: SITE_NAME_TG })}\n📅  ${date}`;

  const productLines = lines
    .map((l, i) => {
      const totalNum = lineTotal(l);
      const total = l.product.price_eur == null ? "—" : fmt(totalNum);
      const effUnit =
        l.quantity > 0 && l.product.price_eur != null ? totalNum / l.quantity : l.product.price_eur;
      const unit = l.product.price_eur == null ? fmtEur(l.product.price_eur) : fmt(effUnit);
      const isPack = PACK_TIERS.some((t) => t.qty === l.quantity);
      return `${i + 1}. ${l.product.title}\n     ${unit} × ${l.quantity} = ${total}${isPack ? tRuntime("tg.packOf", { q: l.quantity }) : ""}`;
    })
    .join("\n\n");

  const totalLine = `${tRuntime("tg.total")}  ${fmt(ordersTotal(lines))}`;

  const nv = tRuntime("tg.notProvided");
  const addressSection = deliveryAddress.trim()
    ? `${tRuntime("tg.shippingAddress")}\n\n    ${deliveryAddress.trim()}`
    : `${tRuntime("tg.shippingAddress")}\n\n    ${nv}`;

  const deliveryMethodSection =
    deliveryMethod === "courier"
      ? [tRuntime("tg.deliveryTitle"), tRuntime("tg.courierDesc")].join("\n")
      : [tRuntime("tg.deliveryTitle"), tRuntime("tg.postDesc")].join("\n");

  const total = ordersTotal(lines);
  const cryptoTotal = cryptoDiscounted(total);
  const payment = [
    tRuntime("tg.paymentHeading"),
    `    ${tRuntime("tg.paymentBank")}  ${fmtEur(total)}`,
    `    ${tRuntime("tg.paymentCrypto")}      ${fmtEur(cryptoTotal)}  ${tRuntime("tg.savePercent", { p: CRYPTO_DISCOUNT_PERCENT })}`,
    `    ${tRuntime("tg.payBefore")}`,
  ].join("\n");

  const footer = tRuntime("tg.footer");

  return [
    header,
    divider,
    tRuntime("tg.orderHeading"),
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