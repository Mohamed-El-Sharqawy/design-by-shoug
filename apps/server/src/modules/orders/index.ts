import { Elysia, t } from "elysia";
import { OrderService } from "./service";
import {
  CreateOrderBody,
  DirectPurchaseBody,
  UpdateOrderStatusBody,
  OrderQueryParams,
  OrderIdParams,
} from "./model";
import { authPlugin, requireAuth, requireAdmin, type AuthUser } from "@/modules/auth";
import { stripe } from "@/lib/stripe";

const publicOrderRoutes = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .derive(({ headers }) => {
    const sessionId = headers["x-session-id"];
    return { sessionId };
  })
  .post(
    "/",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const result = await OrderService.create(ctx.body, user?.id, ctx.sessionId);
      return { success: true, data: result };
    },
    { body: CreateOrderBody }
  )
  .post(
    "/direct",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const result = await OrderService.directPurchase(ctx.body, user?.id);
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
    "/verify-session",
    async ({ query }) => {
      const session = await stripe.checkout.sessions.retrieve(query.session_id);
      if (!session || session.payment_status !== "paid") {
        return { success: false, data: null };
      }
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return { success: false, data: null };
      }
      await OrderService.updatePaymentToPaid(orderId);
      const order = await OrderService.getById(orderId);
      return { success: true, data: order };
    },
    { query: t.Object({ session_id: t.String() }) }
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
  );

export const orderRoutes = new Elysia()
  .use(publicOrderRoutes)
  .use(userOrderRoutes)
  .use(adminOrderRoutes);
