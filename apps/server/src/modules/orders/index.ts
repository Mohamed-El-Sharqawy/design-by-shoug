import { Elysia, t } from "elysia";
import { OrderService } from "./service";
import {
  CreateOrderBody,
  DirectPurchaseBody,
  UpdateOrderStatusBody,
  OrderQueryParams,
  OrderIdParams,
  BulkDeleteOrdersBody,
} from "./model";
import { authPlugin, requireAuth, requireAdmin, type AuthUser } from "@/modules/auth";
import { retrievePaymentIntent } from "@/lib/ziina";

const publicOrderRoutes = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .derive(({ headers }) => {
    const sessionId = headers["x-session-id"];
    const ip = (headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || headers["x-real-ip"] as string || undefined;
    const userAgent = headers["user-agent"] as string || undefined;
    return { sessionId, requestMeta: { ip, userAgent } };
  })
  .post(
    "/",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const result = await OrderService.create(ctx.body, user?.id, ctx.sessionId, ctx.requestMeta);
      return { success: true, data: result };
    },
    { body: CreateOrderBody }
  )
  .post(
    "/direct",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const result = await OrderService.directPurchase(ctx.body, user?.id, ctx.requestMeta);
      return { success: true, data: result };
    },
    { body: DirectPurchaseBody }
  )
  .get(
    "/track/:orderNumber",
    async ({ params }) => {
      const order = await OrderService.getByOrderNumber(params.orderNumber);
      return { success: true, data: order };
    },
    { params: t.Object({ orderNumber: t.String() }) }
  )
  .post(
    "/:id/confirm-payment",
    async ({ params, body }) => {
      const order = await OrderService.confirmPayment(params.id, body.paymentIntentId);
      return { success: true, data: order };
    },
    {
      params: OrderIdParams,
      body: t.Object({ paymentIntentId: t.String() }),
    }
  )
  .get(
    "/verify-payment",
    async ({ query }) => {
      const paymentIntent = await retrievePaymentIntent(query.payment_intent_id);
      if (!paymentIntent || paymentIntent.status !== "completed") {
        return { success: false, data: null };
      }
      const orderId = query.order_id;
      if (!orderId) {
        return { success: false, data: null };
      }
      await OrderService.updatePaymentToPaid(orderId);
      const order = await OrderService.getById(orderId);
      return { success: true, data: order };
    },
    { query: t.Object({ payment_intent_id: t.String(), order_id: t.String() }) }
  );

const userOrderRoutes = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = ctx.user as AuthUser | null;
    if (!user) {
      throw new Error("Authentication required");
    }
  })
  .get(
    "/my-orders",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      const result = await OrderService.getUserOrders(user.id, ctx.query);
      return { success: true, data: result };
    },
    { query: OrderQueryParams }
  )
  .get(
    "/:id",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      const order = await OrderService.getById(ctx.params.id, user.id);
      return { success: true, data: order };
    },
    { params: OrderIdParams }
  );

const adminOrderRoutes = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = ctx.user as AuthUser | null;
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin access required");
    }
  })
  .get(
    "/all",
    async ({ query }) => {
      const result = await OrderService.getAllOrders(query);
      return { success: true, data: result };
    },
    { query: OrderQueryParams }
  )
  .get(
    "/admin/:id",
    async ({ params }) => {
      const order = await OrderService.getById(params.id);
      return { success: true, data: order };
    },
    { params: OrderIdParams }
  )
  .patch(
    "/:id/status",
    async ({ params, body }) => {
      const order = await OrderService.updateStatus(params.id, body);
      return { success: true, data: order };
    },
    { params: OrderIdParams, body: UpdateOrderStatusBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await OrderService.deleteOrder(params.id);
      return { success: true };
    },
    { params: OrderIdParams }
  )
  .post(
    "/bulk-delete",
    async ({ body }) => {
      await OrderService.bulkDeleteOrders(body.ids);
      return { success: true, deleted: body.ids.length };
    },
    { body: BulkDeleteOrdersBody }
  )
  .post(
    "/:id/resend-purchase-event",
    async ({ params }) => {
      const result = await OrderService.resendPurchaseEvent(params.id);
      return { success: true, data: result };
    },
    { params: OrderIdParams }
  );

export const orderRoutes = new Elysia()
  .use(publicOrderRoutes)
  .use(userOrderRoutes)
  .use(adminOrderRoutes);
