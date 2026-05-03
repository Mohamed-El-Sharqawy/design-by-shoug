import { Elysia, t } from "elysia";
import { CouponService } from "./service";
import { CreateCouponBody, UpdateCouponBody, CouponIdParams } from "./model";
import { authPlugin, requireAdmin, type AuthUser } from "@/modules/auth";

const publicCouponRoutes = new Elysia({ prefix: "/coupons" })
  .use(authPlugin)
  .post(
    "/validate",
    async (ctx) => {
      const user = ctx.user as AuthUser | null;
      const result = await CouponService.validateCoupon(ctx.body.code, ctx.body.orderAmount, user?.id);
      return { success: true, data: result };
    },
    {
      body: t.Object({
        code: t.String(),
        orderAmount: t.Number({ minimum: 0 }),
      }),
    }
  );

const adminCouponRoutes = new Elysia({ prefix: "/coupons" })
  .use(requireAdmin)
  .get("/", async () => {
    const coupons = await CouponService.getAll(true);
    return { success: true, data: coupons };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const coupon = await CouponService.getById(params.id);
      return { success: true, data: coupon };
    },
    { params: CouponIdParams }
  )
  .post(
    "/",
    async ({ body }) => {
      const coupon = await CouponService.create(body);
      return { success: true, data: coupon };
    },
    { body: CreateCouponBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const coupon = await CouponService.update(params.id, body);
      return { success: true, data: coupon };
    },
    { params: CouponIdParams, body: UpdateCouponBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await CouponService.delete(params.id);
      return { success: true, message: "Coupon deleted" };
    },
    { params: CouponIdParams }
  );

export const couponRoutes = new Elysia()
  .use(publicCouponRoutes)
  .use(adminCouponRoutes);
