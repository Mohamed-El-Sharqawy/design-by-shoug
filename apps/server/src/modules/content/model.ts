import { t } from "elysia";

export const CreateBannerBody = t.Object({
  imageUrl: t.String(),
  buttonTextEn: t.Optional(t.String()),
  buttonTextAr: t.Optional(t.String()),
  href: t.Optional(t.String()),
  sortOrder: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateBannerBody = t.Partial(CreateBannerBody);

export const CreateInstagramPostBody = t.Object({
  postUrl: t.String(),
  imageUrl: t.String(),
  thumbnailUrl: t.Optional(t.String()),
  captionEn: t.Optional(t.String()),
  captionAr: t.Optional(t.String()),
  sortOrder: t.Optional(t.Number()),
  status: t.Optional(
    t.Union([t.Literal("DRAFT"), t.Literal("PUBLISHED"), t.Literal("ARCHIVED")])
  ),
});

export const UpdateInstagramPostBody = t.Partial(CreateInstagramPostBody);

export const CreateShoppableVideoBody = t.Object({
  titleEn: t.Optional(t.String()),
  titleAr: t.Optional(t.String()),
  descriptionEn: t.Optional(t.String()),
  descriptionAr: t.Optional(t.String()),
  videoUrl: t.String(),
  thumbnailUrl: t.String(),
  sortOrder: t.Optional(t.Number()),
  status: t.Optional(
    t.Union([t.Literal("DRAFT"), t.Literal("PUBLISHED"), t.Literal("ARCHIVED")])
  ),
  productIds: t.Optional(t.Array(t.String())),
});

export const UpdateShoppableVideoBody = t.Partial(CreateShoppableVideoBody);

export const CreateFeaturedProductBody = t.Object({
  productId: t.String(),
  titleEn: t.Optional(t.String()),
  titleAr: t.Optional(t.String()),
  sortOrder: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
  startsAt: t.Optional(t.String()),
  endsAt: t.Optional(t.String()),
});

export const UpdateFeaturedProductBody = t.Partial(
  t.Omit(CreateFeaturedProductBody, ["productId"])
);

export const ContentIdParams = t.Object({
  id: t.String(),
});

export type CreateBannerInput = typeof CreateBannerBody.static;
export type UpdateBannerInput = typeof UpdateBannerBody.static;
export type CreateInstagramPostInput = typeof CreateInstagramPostBody.static;
export type UpdateInstagramPostInput = typeof UpdateInstagramPostBody.static;
export type CreateShoppableVideoInput = typeof CreateShoppableVideoBody.static;
export type UpdateShoppableVideoInput = typeof UpdateShoppableVideoBody.static;
export type CreateFeaturedProductInput = typeof CreateFeaturedProductBody.static;
export type UpdateFeaturedProductInput = typeof UpdateFeaturedProductBody.static;
