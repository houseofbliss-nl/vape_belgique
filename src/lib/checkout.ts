// Checkout VAPELT — porté de checkout.ts vapespot en EUR.
// Commande minimale avant de pouvoir passer commande, remise crypto/gift card.
import { CRYPTO_DISCOUNT_PERCENT } from "./packs";

// Commande minimale (EUR) — transposition du MIN_ORDER_AUD (200 AUD ≈ 120 €)
// ramené à un minimum réaliste pour le marché lituanien du vape.
export const MIN_ORDER_EUR = 30;

export function cryptoDiscountAmount(price: number): number {
  return (price * CRYPTO_DISCOUNT_PERCENT) / 100;
}

/** Montant après réduction crypto / gift card. */
export function cryptoDiscounted(price: number): number {
  return price - cryptoDiscountAmount(price);
}