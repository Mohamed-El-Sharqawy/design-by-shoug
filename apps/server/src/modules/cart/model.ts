import { t } from "elysia";

export const AddToCartBody = t.Object({
  variantId: t.String(),
  quantity: t.Number({ minimum: 1 }),
});

export const UpdateCartItemBody = t.Object({
  quantity: t.Number({ minimum: 1 }),
});

export const ApplyCouponBody = t.Object({
  code: t.String(),
});

export const CartItemIdParams = t.Object({
  itemId: t.String(),
});

export type AddToCartInput = typeof AddToCartBody.static;
export type UpdateCartItemInput = typeof UpdateCartItemBody.static;
