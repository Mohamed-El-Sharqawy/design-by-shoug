import { Elysia, t } from "elysia";
import { ProductService } from "./service";
import {
  CreateProductBody,
  UpdateProductBody,
  CreateVariantBody,
  UpdateVariantBody,
  ProductQueryParams,
  ProductIdParams,
  SetProductImagesBody,
  BulkCreateVariantsBody,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicProductRoutes = new Elysia({ prefix: "/products" })
  .get(
    "/",
    async ({ query }) => {
      const result = await ProductService.getAll(query);
      return { success: true, data: result };
    },
    { query: ProductQueryParams }
  )
  .get(
    "/:id",
    async ({ params }) => {
      const product = await ProductService.getById(params.id);
      return { success: true, data: product };
    },
    { params: ProductIdParams }
  )
  .get(
    "/slug/:slug",
    async ({ params }) => {
      const product = await ProductService.getBySlug(params.slug);
      return { success: true, data: product };
    },
    { params: t.Object({ slug: t.String() }) }
  )
  .get(
    "/variant/:variantId",
    async ({ params }) => {
      const variant = await ProductService.getVariantById(params.variantId);
      return { success: true, data: variant };
    },
    { params: t.Object({ variantId: t.String() }) }
  );

const adminProductRoutes = new Elysia({ prefix: "/products" })
  .use(requireAdmin)
  .post(
    "/",
    async ({ body }) => {
      const product = await ProductService.create(body);
      return { success: true, data: product };
    },
    { body: CreateProductBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const product = await ProductService.update(params.id, body);
      return { success: true, data: product };
    },
    { params: ProductIdParams, body: UpdateProductBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await ProductService.delete(params.id);
      return { success: true, message: "Product deleted" };
    },
    { params: ProductIdParams }
  )
  .post(
    "/:id/variants",
    async ({ params, body }) => {
      const variant = await ProductService.createVariant({
        ...body,
        productId: params.id,
      });
      return { success: true, data: variant };
    },
    {
      params: ProductIdParams,
      body: t.Omit(CreateVariantBody, ["productId"]),
    }
  )
  .patch(
    "/:id/variants/:variantId",
    async ({ params, body }) => {
      const variant = await ProductService.updateVariant(params.variantId, body);
      return { success: true, data: variant };
    },
    {
      params: t.Object({ id: t.String(), variantId: t.String() }),
      body: UpdateVariantBody,
    }
  )
  .delete(
    "/:id/variants/:variantId",
    async ({ params }) => {
      await ProductService.deleteVariant(params.variantId);
      return { success: true, message: "Variant deleted" };
    },
    { params: t.Object({ id: t.String(), variantId: t.String() }) }
  )
  .patch(
    "/:id/variants/:variantId/stock",
    async ({ params, body }) => {
      const variant = await ProductService.updateStock(params.variantId, body.stock);
      return { success: true, data: variant };
    },
    {
      params: t.Object({ id: t.String(), variantId: t.String() }),
      body: t.Object({ stock: t.Number({ minimum: 0 }) }),
    }
  )
  .put(
    "/:id/images",
    async ({ params, body }) => {
      const images = await ProductService.setImages(params.id, body);
      return { success: true, data: images };
    },
    { params: ProductIdParams, body: SetProductImagesBody }
  )
  .put(
    "/:id/variants",
    async ({ params, body }) => {
      const variants = await ProductService.bulkCreateVariants(params.id, body);
      return { success: true, data: variants };
    },
    { params: ProductIdParams, body: BulkCreateVariantsBody }
  );

export const productRoutes = new Elysia()
  .use(publicProductRoutes)
  .use(adminProductRoutes);
