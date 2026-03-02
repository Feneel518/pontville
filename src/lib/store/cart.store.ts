import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddOn = {
  id: string;
  name: string;
  price: number;
  groupId?: string;
  groupName?: string;
};

export type CartVariant = {
  id: string;
  name: string;
  price: number;
};

export type CartLine = {
  key: string;
  menuId: string;
  categorySlug: string;

  menuItemId: string;
  name: string;
  imageUrl?: string;

  variant?: CartVariant | null;

  addOns: CartAddOn[];

  quantity: number;

  unitBasePrice: number;
  unitAddOnsPrice: number;
  unitTotalPrice: number;

  lineTotal: number;
};

export type AddToCartInput = {
  menuItemId: string;
  name: string;
  imageUrl?: string | null;
  menuId: string;
  categorySlug: string;

  // variant is optional (for SIMPLE items it will be null/undefined)
  variant?: CartVariant | null;

  // add-ons optional
  addOns?: CartAddOn[];

  // unitBasePrice required in paise/cents
  // (if SIMPLE -> basePrice, if VARIANT -> selected variant price)
  unitBasePrice: number;

  quantity?: number; // default 1
};

export type CheckoutDetails = {
  customerName: string;
  customerPhone: string;
  pickupTime?: string; // ISO string
  notes?: string;
};

/** ---------- Helper functions (pure) ---------- */
/**
 * Build a stable key for merging cart lines.
 * - addOnIds are sorted to make selection order irrelevant
 *   e.g. [A,B] and [B,A] become same key.
 */
function makeCartKey(input: {
  menuItemId: string;
  variantId?: string | null;
  addOnIds?: string[];
}) {
  const addonPart = (input.addOnIds ?? []).slice().sort().join("-");
  return `${input.menuItemId}__${input.variantId ?? "no-variant"}__${addonPart}`;
}
/** Sum addon prices per unit */
function sumAddOns(addOns: CartAddOn[]) {
  return addOns.reduce((sum, a) => sum + (a.price ?? 0), 0);
}

/** Clamp quantity */
function clampQty(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.floor(qty));
}

/** ---------- Store type ---------- */

type CartState = {
  // ✅ This is the ONLY state we store: an array of cart lines
  items: CartLine[];

  updateLineAddOns: (params: {
    key: string; // existing line key
    addOns: CartAddOn[];
  }) => void;

  // ✅ Actions
  addItem: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;

  // ✅ Derived selectors (computed values)
  subtotal: () => number; // sum of all line totals
  totalQty: () => number; // sum of quantities

  details: CheckoutDetails;
  setDetails: (patch: Partial<CheckoutDetails>) => void;
  clearDetails: () => void;
};

/**
 * ✅ The Zustand store
 * We use `persist` so cart survives page refresh.
 */

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      /** ---------------- STATE ---------------- */
      items: [],

      /** ---------------- ACTIONS ---------------- */
      /**
       * addItem():
       * - Compute key (menuItem + variant + addons)
       * - If key exists -> increase quantity
       * - Else -> add a new CartLine
       */
      addItem: (input) => {
        set((state) => {
          const quantity = clampQty(input.quantity ?? 1);

          const addOns = input.addOns ?? [];
          const variant = input.variant ?? null;

          const unitAddOnsPrice = sumAddOns(addOns);
          const unitTotalPrice = input.unitBasePrice + unitAddOnsPrice;

          const key = makeCartKey({
            menuItemId: input.menuItemId,
            variantId: variant?.id ?? null,
            addOnIds: addOns.map((a) => a.id),
          });

          const existingIndex = state.items.findIndex((i) => i.key === key);
          if (existingIndex >= 0) {
            const next = [...state.items];
            const prev = next[existingIndex];

            const newQty = prev.quantity + quantity;

            next[existingIndex] = {
              ...prev,
              quantity: newQty,
              lineTotal: prev.unitTotalPrice * newQty,
            };

            return { items: next };
          }

          const newLine: CartLine = {
            key,
            menuItemId: input.menuItemId,
            name: input.name,
            imageUrl: input.imageUrl ?? undefined,
            menuId: input.menuId,
            categorySlug: input.categorySlug,
            variant,
            addOns,

            quantity,

            unitBasePrice: input.unitBasePrice,
            unitAddOnsPrice,
            unitTotalPrice,

            lineTotal: unitTotalPrice * quantity,
          };

          return { items: [...state.items, newLine] };
        });
      },

      /** Remove a line completely */
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),

      /**
       * setQty():
       * - Update quantity for a line
       * - If qty <= 0 we remove line (but here we clamp to minimum 1)
       * If you want "0 removes", we can implement that too.
       */
      setQty: (key, qty) =>
        set((state) => {
          const nextQty = Math.max(0, Math.floor(qty));

          if (nextQty === 0) {
            return { items: state.items.filter((i) => i.key !== key) };
          }
          return {
            items: state.items.map((i) =>
              i.key === key
                ? {
                    ...i,
                    quantity: nextQty,
                    lineTotal: i.unitTotalPrice * nextQty,
                  }
                : i,
            ),
          };
        }),

      /** Clear entire cart */
      clear: () => set({ items: [] }),

      /** ---------------- DERIVED ---------------- */

      /** Cart subtotal (paise/cents) */
      subtotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),

      /** Total quantity (for badge count) */
      totalQty: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      updateLineAddOns: ({ key, addOns }) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.key === key);
          if (idx < 0) return state;

          const current = state.items[idx];
          const variantId = current.variant?.id ?? null;

          const newKey = cartKeyForUI({
            menuItemId: current.menuItemId,
            variantId,
            addOnIds: addOns.map((a) => a.id),
          });

          const unitAddOnsPrice = addOns.reduce(
            (s, a) => s + (a.price ?? 0),
            0,
          );
          const unitTotalPrice = current.unitBasePrice + unitAddOnsPrice;

          const updated = {
            ...current,
            key: newKey,
            addOns,
            unitAddOnsPrice,
            unitTotalPrice,
            lineTotal: unitTotalPrice * current.quantity,
          };

          // if this new config already exists in cart -> merge quantities
          const collide = state.items.findIndex((i) => i.key === newKey);
          if (collide >= 0 && collide !== idx) {
            const next = [...state.items];
            const existing = next[collide];

            const mergedQty = existing.quantity + current.quantity;
            next[collide] = {
              ...existing,
              quantity: mergedQty,
              lineTotal: existing.unitTotalPrice * mergedQty,
            };

            next.splice(idx, 1); // remove old line
            return { items: next };
          }

          const next = [...state.items];
          next[idx] = updated;
          return { items: next };
        }),

      details: {
        customerName: "",
        customerPhone: "",
        pickupTime: "",
        notes: "",
      },
      setDetails: (patch) =>
        set((s) => ({
          details: { ...s.details, ...patch },
        })),
      clearDetails: () =>
        set(() => ({
          details: {
            customerName: "",
            customerPhone: "",
            pickupTime: "",
            notes: "",
          },
        })),
    }),
    {
      name: "pontville-cart-v1",
      version: 1,
    },
  ),
);

export function cartKeyForUI(params: {
  menuItemId: string;
  variantId?: string | null;
  addOnIds?: string[];
}) {
  const addonPart = (params.addOnIds ?? []).slice().sort().join("-");
  return `${params.menuItemId}__${params.variantId ?? "no-variant"}__${addonPart}`;
}
