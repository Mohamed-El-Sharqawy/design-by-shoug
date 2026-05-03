import { Elysia, t } from "elysia";
import { WishlistService } from "./service";
import { authPlugin, type AuthUser } from "@/modules/auth";

export const wishlistRoutes = new Elysia({ prefix: "/wishlist" })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    if (!(ctx.user as AuthUser | null)) {
      throw new Error("Authentication required");
    }
  })
  .get("/", async (ctx) => {
    const user = ctx.user as AuthUser;
    const items = await WishlistService.getWishlist(user.id);
    return { success: true, data: items };
  })
  .post(
    "/",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      const item = await WishlistService.addItem(user.id, ctx.body.productId);
      return { success: true, data: item };
    },
    { body: t.Object({ productId: t.String() }) }
  )
  .delete(
    "/:productId",
    async (ctx) => {
      const user = ctx.user as AuthUser;
      await WishlistService.removeItem(user.id, ctx.params.productId);
      return { success: true, message: "Removed from wishlist" };
    },
    { params: t.Object({ productId: t.String() }) }
  );
