import { t } from "elysia";

export const CreateShippingZoneBody = t.Object({
  nameEn: t.String({ minLength: 1 }),
  nameAr: t.String({ minLength: 1 }),
  countries: t.Array(t.String()),
  cities: t.Array(t.String()),
  baseCost: t.Number({ minimum: 0 }),
  freeShippingMin: t.Optional(t.Number({ minimum: 0 })),
  estimatedDaysMin: t.Optional(t.Number({ minimum: 1 })),
  estimatedDaysMax: t.Optional(t.Number({ minimum: 1 })),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateShippingZoneBody = t.Partial(CreateShippingZoneBody);

export const ShippingZoneIdParams = t.Object({
  id: t.String(),
});

export type CreateShippingZoneInput = typeof CreateShippingZoneBody.static;
export type UpdateShippingZoneInput = typeof UpdateShippingZoneBody.static;
