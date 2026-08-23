// Aide commande — réduction crypto (portée de checkout.ts vapespot).
import { CRYPTO_DISCOUNT_PERCENT } from "./packs";

export function cryptoDiscountAmount(price: number): number {
  return (price * CRYPTO_DISCOUNT_PERCENT) / 100;
}

/** Montant après réduction crypto / gift card. */
export function cryptoDiscounted(price: number): number {
  return price - cryptoDiscountAmount(price);
}