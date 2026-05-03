import { Elysia, t } from "elysia";
import { AbayaLengthService } from "./service";
import {
  CreateAbayaLengthBody,
  UpdateAbayaLengthBody,
  AbayaLengthIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicAbayaLengthRoutes = new Elysia({ prefix: "/abaya-lengths" })
  .get("/", async () => {
    const lengths = await AbayaLengthService.getAll();
    return { success: true, data: lengths };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const length = await AbayaLengthService.getById(params.id);
      return { success: true, data: length };
    },
    { params: AbayaLengthIdParams }
  );

const adminAbayaLengthRoutes = new Elysia({ prefix: "/abaya-lengths" })
  .use(requireAdmin)
  .get("/all", async () => {
    const lengths = await AbayaLengthService.getAll(true);
    return { success: true, data: lengths };
  })
  .post(
    "/",
    async ({ body }) => {
      const length = await AbayaLengthService.create(body);
      return { success: true, data: length };
    },
    { body: CreateAbayaLengthBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const length = await AbayaLengthService.update(params.id, body);
      return { success: true, data: length };
    },
    { params: AbayaLengthIdParams, body: UpdateAbayaLengthBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await AbayaLengthService.delete(params.id);
      return { success: true, message: "AbayaLength deleted" };
    },
    { params: AbayaLengthIdParams }
  );

export const abayaLengthRoutes = new Elysia()
  .use(publicAbayaLengthRoutes)
  .use(adminAbayaLengthRoutes);
