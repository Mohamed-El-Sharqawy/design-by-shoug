import { Elysia, t } from "elysia";
import { BodySizeService } from "./service";
import {
  CreateBodySizeBody,
  UpdateBodySizeBody,
  BodySizeIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicBodySizeRoutes = new Elysia({ prefix: "/body-sizes" })
  .get("/", async () => {
    const sizes = await BodySizeService.getAll();
    return { success: true, data: sizes };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const size = await BodySizeService.getById(params.id);
      return { success: true, data: size };
    },
    { params: BodySizeIdParams }
  );

const adminBodySizeRoutes = new Elysia({ prefix: "/body-sizes" })
  .use(requireAdmin)
  .get("/all", async () => {
    const sizes = await BodySizeService.getAll(true);
    return { success: true, data: sizes };
  })
  .post(
    "/",
    async ({ body }) => {
      const size = await BodySizeService.create(body);
      return { success: true, data: size };
    },
    { body: CreateBodySizeBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const size = await BodySizeService.update(params.id, body);
      return { success: true, data: size };
    },
    { params: BodySizeIdParams, body: UpdateBodySizeBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await BodySizeService.delete(params.id);
      return { success: true, message: "BodySize deleted" };
    },
    { params: BodySizeIdParams }
  );

export const bodySizeRoutes = new Elysia()
  .use(publicBodySizeRoutes)
  .use(adminBodySizeRoutes);
