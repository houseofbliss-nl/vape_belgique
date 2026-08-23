// Panier (My List) — localStorage, équivalent vanilla de storage.ts vapespot.
// API synchrone lue par le JS progresse-enhance des pages.

const LIST_KEY = "vapelt:my-list";
const AGE_KEY = "vapelt:age-verified";

export type { ListItem } from "./types";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("vapelt:storage", { detail: { key } }));
}

export function getItems() {
  return read<{ productId: number; quantity: number }[]>(LIST_KEY, []);
}

export function getCount(): number {
  return getItems().reduce((s, i) => s + i.quantity, 0);
}

export function add(productId: number, quantity = 1) {
  const current = getItems();
  const idx = current.findIndex((i) => i.productId === productId);
  const next =
    idx >= 0
      ? current.map((i, n) =>
          n === idx ? { ...i, quantity: i.quantity + quantity } : i
        )
      : [...current, { productId, quantity }];
  write(LIST_KEY, next);
  return next;
}

export function setQuantity(productId: number, quantity: number) {
  const current = getItems();
  const next =
    quantity <= 0
      ? current.filter((i) => i.productId !== productId)
      : current.some((i) => i.productId === productId)
        ? current.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        : [...current, { productId, quantity }];
  write(LIST_KEY, next);
  return next;
}

export function remove(productId: number) {
  const next = getItems().filter((i) => i.productId !== productId);
  write(LIST_KEY, next);
  return next;
}

export function clear() {
  write(LIST_KEY, []);
}

export function isAgeVerified(): boolean {
  return read<boolean>(AGE_KEY, false);
}

export function verifyAge() {
  write(AGE_KEY, true);
}

// Réagit aux changements de panier venant d'un autre onglet.
export function onStorageChanged(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("vapelt:storage", () => cb());
}