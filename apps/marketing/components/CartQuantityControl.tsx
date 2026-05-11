"use client";

import { useCartItems, useUpdateCartQuantity } from "@/lib/cart-hooks";
import { trackRemoveFromCart } from "@/lib/fb-helpers";

interface CartQuantityControlProps {
  variantId: string;
}

export function CartQuantityControl({ variantId }: CartQuantityControlProps) {
  const items = useCartItems();
  const updateQty = useUpdateCartQuantity();
  const cartItem = items.find((i) => i.variantId === variantId);

  if (!cartItem) return null;

  return (
    <div className="inline-flex items-center border border-[#1A1A1A]">
      <button
        type="button"
        onClick={() => {
          if (cartItem.quantity - 1 <= 0) trackRemoveFromCart(cartItem);
          updateQty.mutate(variantId, cartItem.quantity - 1);
        }}
        className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors text-sm"
      >
        −
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-xs border-x border-[#1A1A1A] bg-[#1A1A1A] text-white">
        {cartItem.quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQty.mutate(variantId, cartItem.quantity + 1)}
        className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#FAF9F7] transition-colors text-sm"
      >
        +
      </button>
    </div>
  );
}
