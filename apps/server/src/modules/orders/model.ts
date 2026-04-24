import { t } from "elysia";

export const CreateOrderBody = t.Object({
  addressId: t.Optional(t.String()),
  address: t.Optional(
    t.Object({
      fullName: t.String(),
      phone: t.String(),
      country: t.String(),
      city: t.String(),
      district: t.Optional(t.String()),
      street: t.String(),
      building: t.Optional(t.String()),
      apartment: t.Optional(t.String()),
      postalCode: t.Optional(t.String()),
    })
  ),
  paymentMethod: t.Union([
    t.Literal("CASH_ON_DELIVERY"),
    t.Literal("CREDIT_CARD"),
    t.Literal("DEBIT_CARD"),
    t.Literal("APPLE_PAY"),
    t.Literal("MADA"),
  ]),
  notesCustomer: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
});

export const UpdateOrderStatusBody = t.Object({
  status: t.Union([
    t.Literal("PENDING"),
    t.Literal("CONFIRMED"),
    t.Literal("PROCESSING"),
    t.Literal("SHIPPED"),
    t.Literal("DELIVERED"),
    t.Literal("CANCELLED"),
    t.Literal("REFUNDED"),
  ]),
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

export type CreateOrderInput = typeof CreateOrderBody.static;
export type UpdateOrderStatusInput = typeof UpdateOrderStatusBody.static;
export type OrderQueryInput = typeof OrderQueryParams.static;
