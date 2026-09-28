// Checkout VAPELT — porté de checkout.ts vapespot en EUR.
// Commande minimale avant de pouvoir passer commande, remise crypto/gift card.
import { CRYPTO_DISCOUNT_PERCENT } from "./packs";

// Commande minimale (EUR) — marché belge : livraison par coursier/poste,
// 50 € minimum pour que la commande soit rentable. Utilisée sur la page
// produit (bouton Telegram) ET le récap de commande (order-summary).
export const MIN_ORDER_EUR = 50;

export function cryptoDiscountAmount(price: number): number {
  return (price * CRYPTO_DISCOUNT_PERCENT) / 100;
}

/** Montant après réduction crypto / gift card. */
export function cryptoDiscounted(price: number): number {
  return price - cryptoDiscountAmount(price);
}