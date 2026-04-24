import { t } from "elysia";

export const CreateCollectionBody = t.Object({
  slug: t.String({ minLength: 1 }),
  nameEn: t.String({ minLength: 1 }),
  nameAr: t.String({ minLength: 1 }),
  descriptionEn: t.Optional(t.String()),
  descriptionAr: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateCollectionBody = t.Partial(CreateCollectionBody);

export const CollectionIdParams = t.Object({
  id: t.String(),
});

export type CreateCollectionInput = typeof CreateCollectionBody.static;
export type UpdateCollectionInput = typeof UpdateCollectionBody.static;
