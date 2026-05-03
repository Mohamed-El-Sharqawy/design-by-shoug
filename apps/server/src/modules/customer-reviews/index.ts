import { Elysia } from "elysia";
import { CustomerReviewService } from "./service";
import {
  CreateCustomerReviewBody,
  UpdateCustomerReviewBody,
  CustomerReviewIdParams,
} from "./model";
import { requireAdmin } from "@/modules/auth";

const publicCustomerReviewRoutes = new Elysia({ prefix: "/customer-reviews" })
  .get("/", async () => {
    const reviews = await CustomerReviewService.getAll();
    return { success: true, data: reviews };
  })
  .get(
    "/:id",
    async ({ params }) => {
      const review = await CustomerReviewService.getById(params.id);
      return { success: true, data: review };
    },
    { params: CustomerReviewIdParams }
  );

const adminCustomerReviewRoutes = new Elysia({ prefix: "/customer-reviews" })
  .use(requireAdmin)
  .get("/all", async () => {
    const reviews = await CustomerReviewService.getAll(true);
    return { success: true, data: reviews };
  })
  .post(
    "/",
    async ({ body }) => {
      const review = await CustomerReviewService.create(body);
      return { success: true, data: review };
    },
    { body: CreateCustomerReviewBody }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const review = await CustomerReviewService.update(params.id, body);
      return { success: true, data: review };
    },
    { params: CustomerReviewIdParams, body: UpdateCustomerReviewBody }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await CustomerReviewService.delete(params.id);
      return { success: true, message: "CustomerReview deleted" };
    },
    { params: CustomerReviewIdParams }
  );

export const customerReviewRoutes = new Elysia()
  .use(publicCustomerReviewRoutes)
  .use(adminCustomerReviewRoutes);
