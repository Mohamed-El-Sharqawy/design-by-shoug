import { Elysia, t } from "elysia";
import { ShippingService } from "./service";
import {
  CreateShippingZoneBody,
  UpdateShippingZoneBody,
  ShippingZoneIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicShippingRoutes = new Elysia({ prefix: "/shipping" })
  .get("/zones", async () => {
    const zones = await ShippingService.getAll();
    return { success: true, data: zones };
  })
  .post(
    "/calculate",
    async ({ body }) => {
      const result = await ShippingService.calculateShipping(
        body.city,
        body.orderAmount
      );
      return { success: true, data: result };
    },
    {
      body: t.Object({
        city: t.String(),
        orderAmount: t.Number({ minimum: 0 }),
      }),
    }
  );

const adminShippingRoutes = new Elysia({ prefix: "/shipping" })
  .use(requireAdmin)
  .get("/zones/all", async () => {
    const zones = await ShippingService.getAll(true);
    return { success: true, data: zones };
  })
  .get(
    "/zones/:id",
    async ({ params }) => {
      const zone = await ShippingService.getById(params.id);
      return { success: true, data: zone };
    },
    { params: ShippingZoneIdParams }
  )
  .post(
    "/zones",
    async ({ body }) => {
      const zone = await ShippingService.create(body);
      return { success: true, data: zone };
    },
    { body: CreateShippingZoneBody }
  )
  .patch(
    "/zones/:id",
    async ({ params, body }) => {
      const zone = await ShippingService.update(params.id, body);
      return { success: true, data: zone };
    },
    { params: ShippingZoneIdParams, body: UpdateShippingZoneBody }
  )
  .delete(
    "/zones/:id",
    async ({ params }) => {
      await ShippingService.delete(params.id);
      return { success: true, message: "Shipping zone deleted" };
    },
    { params: ShippingZoneIdParams }
  );

export const shippingRoutes = new Elysia()
  .use(publicShippingRoutes)
  .use(adminShippingRoutes);
