import { t } from "elysia";

export const CreateBodySizeBody = t.Object({
  code: t.String({ minLength: 1 }),
  labelEn: t.String({ minLength: 1 }),
  labelAr: t.String({ minLength: 1 }),
  bustInches: t.Number(),
  hipInches: t.Number(),
  sleevesInches: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateBodySizeBody = t.Partial(CreateBodySizeBody);

export const BodySizeIdParams = t.Object({
  id: t.String(),
});

export type CreateBodySizeInput = typeof CreateBodySizeBody.static;
export type UpdateBodySizeInput = typeof UpdateBodySizeBody.static;
