import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemLocal } from "@repo/api-client/services/cart";

interface CartStore {
  items: CartItemLocal[];
  token: string | null;
  setItems: (items: CartItemLocal[]) => void;
  setToken: (token: string | null) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      token: null,
      setItems: (items) => set({ items }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "dbs_cart",
      partialize: (state) => ({ items: state.items, token: state.token }),
    }
  )
);

export function computeSubtotal(items: CartItemLocal[]): number {
  return items.reduce((sum, i) => {
    const basePrice = Number(i.basePrice) || 0;
    const salePrice = i.salePrice != null ? Number(i.salePrice) : null;
    const adj = Number(i.priceAdjustment) || 0;
    const base =
      salePrice != null && salePrice < basePrice ? salePrice : basePrice;
    return sum + (base + adj) * i.quantity;
  }, 0);
}

export type { CartItemLocal };
