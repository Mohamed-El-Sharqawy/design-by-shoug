import { Elysia } from "elysia";
import { CartService } from "./service";
import {
  AddToCartBody,
  UpdateCartItemBody,
  ApplyCouponBody,
  CartItemIdParams,
  MergeCartBody,
} from "./model";
import { authPlugin, type AuthUser } from "@/modules/auth";

export const cartRoutes = new Elysia({ prefix: "/cart" })
  .use(authPlugin)
  .derive(({ headers }) => {
    const sessionId = headers["x-session-id"];
    return { sessionId };
  })
  .get("/", async (ctx) => {
    const user = ctx.user as AuthUser | null;
    const cart = await CartService.getCart(user?.id, ctx.sessionId);
    return { success: true, data: cart };
  })
  .post(
    "/items",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const cart = await CartService.addItem(ctx.body, user?.id, ctx.sessionId);
      return { success: true, data: cart };
    },
    { body: AddToCartBody }
  )
  .patch(
    "/items/:itemId",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const cart = await CartService.updateItem(ctx.params.itemId, ctx.body, user?.id, ctx.sessionId);
      return { success: true, data: cart };
    },
    { params: CartItemIdParams, body: UpdateCartItemBody }
  )
  .delete(
    "/items/:itemId",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const cart = await CartService.removeItem(ctx.params.itemId, user?.id, ctx.sessionId);
      return { success: true, data: cart };
    },
    { params: CartItemIdParams }
  )
  .delete("/", async (ctx) => {
    const user = ctx.user as AuthUser | null;
    const cart = await CartService.clearCart(user?.id, ctx.sessionId);
    return { success: true, data: cart };
  })
  .post(
    "/coupon",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const cart = await CartService.applyCoupon(ctx.body.code, user?.id, ctx.sessionId);
      return { success: true, data: cart };
    },
    { body: ApplyCouponBody }
  )
  .delete("/coupon", async (ctx) => {
    const user = ctx.user as AuthUser | null;
    const cart = await CartService.removeCoupon(user?.id, ctx.sessionId);
    return { success: true, data: cart };
  })
  .post(
    "/merge",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      if (!user) {
        throw new Error("Authentication required for cart merge");
      }
      const cart = await CartService.mergeItems(user.id, ctx.body);
      return { success: true, data: cart };
    },
    { body: MergeCartBody }
  );
