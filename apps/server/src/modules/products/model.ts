import { t } from "elysia";

export const ProductImageInput = t.Object({
  url: t.String({ minLength: 1 }),
  altTextEn: t.Optional(t.String()),
  altTextAr: t.Optional(t.String()),
  isPrimary: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const VariantInput = t.Object({
  sku: t.String({ minLength: 1 }),
  abayaLengthId: t.String(),
  bodySizeId: t.String(),
  colorId: t.Optional(t.Nullable(t.String())),
  priceAdjustment: t.Optional(t.Number()),
  stock: t.Optional(t.Number({ minimum: 0 })),
});

export const CreateProductBody = t.Object({
  sku: t.String({ minLength: 1 }),
  slug: t.String({ minLength: 1 }),
  nameEn: t.String({ minLength: 1 }),
  nameAr: t.String({ minLength: 1 }),
  descriptionEn: t.Optional(t.String()),
  descriptionAr: t.Optional(t.String()),
  shortDescEn: t.Optional(t.String()),
  shortDescAr: t.Optional(t.String()),
  basePrice: t.Number({ minimum: 0 }),
  salePrice: t.Optional(t.Number({ minimum: 0 })),
  costPrice: t.Optional(t.Number({ minimum: 0 })),
  hasColorOptions: t.Optional(t.Boolean()),
  metaTitleEn: t.Optional(t.String()),
  metaTitleAr: t.Optional(t.String()),
  metaDescEn: t.Optional(t.String()),
  metaDescAr: t.Optional(t.String()),
  isFeatured: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  isNewArrival: t.Optional(t.Boolean()),
  collectionIds: t.Optional(t.Array(t.String())),
  images: t.Optional(t.Array(ProductImageInput)),
  variants: t.Optional(t.Array(VariantInput)),
});

export const UpdateProductBody = t.Partial(CreateProductBody);

export const CreateVariantBody = t.Object({
  sku: t.String({ minLength: 1 }),
  productId: t.String(),
  abayaLengthId: t.String(),
  bodySizeId: t.String(),
  colorId: t.Optional(t.Nullable(t.String())),
  priceAdjustment: t.Optional(t.Number()),
  stock: t.Optional(t.Number({ minimum: 0 })),
  lowStockAlert: t.Optional(t.Number({ minimum: 0 })),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateVariantBody = t.Partial(
  t.Omit(CreateVariantBody, ["productId"])
);

export const CreateProductImageInput = t.Object({
  url: t.String({ minLength: 1 }),
  altTextEn: t.Optional(t.String()),
  altTextAr: t.Optional(t.String()),
  isPrimary: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const SetProductImagesBody = t.Array(CreateProductImageInput);

export const BulkCreateVariantsBody = t.Array(
  t.Omit(CreateVariantBody, ["productId"])
);

export const ProductQueryParams = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
  collectionId: t.Optional(t.String()),
  isActive: t.Optional(t.String()),
  isFeatured: t.Optional(t.String()),
  isNewArrival: t.Optional(t.String()),
  sortBy: t.Optional(t.String()),
  sortOrder: t.Optional(t.String()),
  minPrice: t.Optional(t.String()),
  maxPrice: t.Optional(t.String()),
});

export const ProductIdParams = t.Object({
  id: t.String(),
});

export const VariantIdParams = t.Object({
  id: t.String(),
  variantId: t.String(),
});

export type CreateProductInput = typeof CreateProductBody.static;
export type UpdateProductInput = typeof UpdateProductBody.static;
export type CreateVariantInput = typeof CreateVariantBody.static;
export type UpdateVariantInput = typeof UpdateVariantBody.static;
export type ProductQueryInput = typeof ProductQueryParams.static;
export type ProductImageInput = typeof CreateProductImageInput.static;
export type BulkVariantInput = typeof BulkCreateVariantsBody.static;
