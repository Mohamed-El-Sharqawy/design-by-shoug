import { t } from "elysia";

export const CreateCouponBody = t.Object({
  code: t.String({ minLength: 1 }),
  descriptionEn: t.Optional(t.String()),
  descriptionAr: t.Optional(t.String()),
  type: t.Union([
    t.Literal("PERCENTAGE"),
    t.Literal("FIXED_AMOUNT"),
    t.Literal("FREE_SHIPPING"),
  ]),
  value: t.Number({ minimum: 0 }),
  minOrderAmount: t.Optional(t.Number({ minimum: 0 })),
  maxDiscount: t.Optional(t.Number({ minimum: 0 })),
  usageLimit: t.Optional(t.Number({ minimum: 1 })),
  perUserLimit: t.Optional(t.Number({ minimum: 1 })),
  startsAt: t.Optional(t.String()),
  expiresAt: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateCouponBody = t.Partial(CreateCouponBody);

export const CouponIdParams = t.Object({
  id: t.String(),
});

export type CreateCouponInput = typeof CreateCouponBody.static;
export type UpdateCouponInput = typeof UpdateCouponBody.static;
