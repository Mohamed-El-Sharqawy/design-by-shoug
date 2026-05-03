import { Elysia, t } from "elysia";
import { ColorService } from "./service";
import {
  CreateColorBody,
  UpdateColorBody,
  ColorIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicColorRoutes = new Elysia({ prefix: "/colors" })
  .get("/", async () => {
    const colors = await ColorService.getAll();
    return { success: true, data: colors };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const color = await ColorService.getById(params.id);
      return { success: true, data: color };
    },
    { params: ColorIdParams }
  );

const adminColorRoutes = new Elysia({ prefix: "/colors" })
  .use(requireAdmin)
  .get("/all", async () => {
    const colors = await ColorService.getAll(true);
    return { success: true, data: colors };
  })
  .post(
    "/",
    async ({ body }) => {
      const color = await ColorService.create(body);
      return { success: true, data: color };
    },
    { body: CreateColorBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const color = await ColorService.update(params.id, body);
      return { success: true, data: color };
    },
    { params: ColorIdParams, body: UpdateColorBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await ColorService.delete(params.id);
      return { success: true, message: "Color deleted" };
    },
    { params: ColorIdParams }
  );

export const colorRoutes = new Elysia()
  .use(publicColorRoutes)
  .use(adminColorRoutes);
