import { t } from "elysia";

export const CreateAbayaLengthBody = t.Object({
  inches: t.Number({ minimum: 1 }),
  labelEn: t.String({ minLength: 1 }),
  labelAr: t.String({ minLength: 1 }),
  idealHeightCm: t.Number(),
  idealHeightFt: t.String({ minLength: 1 }),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateAbayaLengthBody = t.Partial(CreateAbayaLengthBody);

export const AbayaLengthIdParams = t.Object({
  id: t.String(),
});

export type CreateAbayaLengthInput = typeof CreateAbayaLengthBody.static;
export type UpdateAbayaLengthInput = typeof UpdateAbayaLengthBody.static;
