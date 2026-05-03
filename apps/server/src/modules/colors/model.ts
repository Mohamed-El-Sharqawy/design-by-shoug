import { t } from "elysia";

export const CreateColorBody = t.Object({
  code: t.String({ minLength: 1 }),
  nameEn: t.String({ minLength: 1 }),
  nameAr: t.String({ minLength: 1 }),
  hexCode: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateColorBody = t.Partial(CreateColorBody);

export const ColorIdParams = t.Object({
  id: t.String(),
});

export type CreateColorInput = typeof CreateColorBody.static;
export type UpdateColorInput = typeof UpdateColorBody.static;
