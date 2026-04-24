import { Elysia, t } from "elysia";
import { CollectionService } from "./service";
import {
  CreateCollectionBody,
  UpdateCollectionBody,
  CollectionIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicCollectionRoutes = new Elysia({ prefix: "/collections" })
  .get("/", async () => {
    const collections = await CollectionService.getAll();
    return { success: true, data: collections };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const collection = await CollectionService.getById(params.id);
      return { success: true, data: collection };
    },
    { params: CollectionIdParams }
  )
  .get(
    "/slug/:slug",
    async ({ params }) => {
      const collection = await CollectionService.getBySlug(params.slug);
      return { success: true, data: collection };
    },
    { params: t.Object({ slug: t.String() }) }
  );

const adminCollectionRoutes = new Elysia({ prefix: "/collections" })
  .use(requireAdmin)
  .get("/all", async () => {
    const collections = await CollectionService.getAll(true);
    return { success: true, data: collections };
  })
  .post(
    "/",
    async ({ body }) => {
      const collection = await CollectionService.create(body);
      return { success: true, data: collection };
    },
    { body: CreateCollectionBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const collection = await CollectionService.update(params.id, body);
      return { success: true, data: collection };
    },
    { params: CollectionIdParams, body: UpdateCollectionBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await CollectionService.delete(params.id);
      return { success: true, message: "Collection deleted" };
    },
    { params: CollectionIdParams }
  );

export const collectionRoutes = new Elysia()
  .use(publicCollectionRoutes)
  .use(adminCollectionRoutes);
