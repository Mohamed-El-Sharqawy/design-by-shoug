import { t } from "elysia";
import { CustomMeasurementsSchema } from "@/modules/cart/model";

const AddressSchema = t.Object({
  fullName: t.String(),
  phone: t.String(),
  country: t.String(),
  city: t.String(),
  district: t.Optional(t.String()),
  street: t.String(),
  building: t.Optional(t.String()),
  apartment: t.Optional(t.String()),
  postalCode: t.Optional(t.String()),
});

const GuestOrderItemSchema = t.Object({
  variantId: t.String(),
  quantity: t.Number({ minimum: 1 }),
  isCustomSize: t.Optional(t.Boolean()),
  customMeasurements: t.Optional(CustomMeasurementsSchema),
  note: t.Optional(t.String()),
});

export const CreateOrderBody = t.Object({
  addressId: t.Optional(t.String()),
  address: t.Optional(AddressSchema),
  paymentMethod: t.Union([
    t.Literal("CASH_ON_DELIVERY"),
    t.Literal("CREDIT_CARD"),
    t.Literal("DEBIT_CARD"),
    t.Literal("APPLE_PAY"),
    t.Literal("MADA"),
  ]),
  notesCustomer: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
  couponCode: t.Optional(t.String()),
  items: t.Optional(t.Array(GuestOrderItemSchema)),
  locale: t.Optional(t.String()),
  fbp: t.Optional(t.String()),
  fbc: t.Optional(t.String()),
});

// Direct purchase: buy a single item without adding to cart
export const DirectPurchaseBody = t.Object({
  variantId: t.String(),
  quantity: t.Number({ minimum: 1 }),
  isCustomSize: t.Optional(t.Boolean()),
  customMeasurements: t.Optional(CustomMeasurementsSchema),
  note: t.Optional(t.String()),
  addressId: t.Optional(t.String()),
  address: t.Optional(AddressSchema),
  paymentMethod: t.Union([
    t.Literal("CASH_ON_DELIVERY"),
    t.Literal("CREDIT_CARD"),
    t.Literal("DEBIT_CARD"),
    t.Literal("APPLE_PAY"),
    t.Literal("MADA"),
  ]),
  notesCustomer: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
  couponCode: t.Optional(t.String()),
  locale: t.Optional(t.String()),
  fbp: t.Optional(t.String()),
  fbc: t.Optional(t.String()),
});

export const UpdateOrderStatusBody = t.Object({
  status: t.Optional(t.Union([
    t.Literal("PENDING"),
    t.Literal("CONFIRMED"),
    t.Literal("PROCESSING"),
    t.Literal("SHIPPED"),
    t.Literal("DELIVERED"),
    t.Literal("CANCELLED"),
    t.Literal("REFUNDED"),
  ])),
  paymentStatus: t.Optional(t.Union([
    t.Literal("PENDING"),
    t.Literal("PAID"),
    t.Literal("FAILED"),
    t.Literal("REFUNDED"),
  ])),
  notesInternal: t.Optional(t.String()),
});

export const OrderQueryParams = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
});

export const OrderIdParams = t.Object({
  id: t.String(),
});

export const BulkDeleteOrdersBody = t.Object({
  ids: t.Array(t.String()),
});

export type CreateOrderInput = typeof CreateOrderBody.static;
export type DirectPurchaseInput = typeof DirectPurchaseBody.static;
export type UpdateOrderStatusInput = typeof UpdateOrderStatusBody.static;
export type OrderQueryInput = typeof OrderQueryParams.static;
export type BulkDeleteOrdersInput = typeof BulkDeleteOrdersBody.static;
