import { t } from "elysia";

export const CustomMeasurementsSchema = t.Object({
  abayaLength: t.Number({ minimum: 1 }),
  sleeveLength: t.Number({ minimum: 1 }),
  bust: t.Number({ minimum: 1 }),
  waist: t.Number({ minimum: 1 }),
  hip: t.Number({ minimum: 1 }),
});

export const AddToCartBody = t.Object({
  variantId: t.String(),
  quantity: t.Number({ minimum: 1 }),
  isCustomSize: t.Optional(t.Boolean()),
  customMeasurements: t.Optional(CustomMeasurementsSchema),
  note: t.Optional(t.String()),
});

export const UpdateCartItemBody = t.Object({
  quantity: t.Optional(t.Number({ minimum: 1 })),
  note: t.Optional(t.String()),
});

export const ApplyCouponBody = t.Object({
  code: t.String(),
});

export const CartItemIdParams = t.Object({
  itemId: t.String(),
});

export const MergeCartBody = t.Array(
  t.Object({
    variantId: t.String(),
    quantity: t.Number({ minimum: 1 }),
  })
);

export type AddToCartInput = typeof AddToCartBody.static;
export type UpdateCartItemInput = typeof UpdateCartItemBody.static;
export type CustomMeasurements = typeof CustomMeasurementsSchema.static;
