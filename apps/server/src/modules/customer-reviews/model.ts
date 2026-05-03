import { t } from "elysia";

export const ReviewerTypeEnum = t.Union([
  t.Literal("CUSTOMER"),
  t.Literal("MODEL"),
  t.Literal("INFLUENCER"),
]);

export const CreateCustomerReviewBody = t.Object({
  videoUrl: t.String({ minLength: 1 }),
  thumbnailUrl: t.Optional(t.String()),
  name: t.String({ minLength: 1 }),
  type: t.Optional(ReviewerTypeEnum),
  relation: t.Optional(t.String()),
  productId: t.Optional(t.String()),
  feedbackEn: t.Optional(t.String()),
  feedbackAr: t.Optional(t.String()),
  rating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
  sortOrder: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
  reviewDate: t.Optional(t.String()),
});

export const UpdateCustomerReviewBody = t.Partial(CreateCustomerReviewBody);

export const CustomerReviewIdParams = t.Object({
  id: t.String(),
});

export type CreateCustomerReviewInput = typeof CreateCustomerReviewBody.static;
export type UpdateCustomerReviewInput = typeof UpdateCustomerReviewBody.static;
