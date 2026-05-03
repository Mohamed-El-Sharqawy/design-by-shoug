import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateCustomerReviewInput, UpdateCustomerReviewInput } from "./model";

export abstract class CustomerReviewService {
  static async getAll(includeInactive = false) {
    return prisma.customerReview.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            basePrice: true,
            salePrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  static async getById(id: string) {
    const review = await prisma.customerReview.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundError("CustomerReview");
    }

    return review;
  }

  static async create(input: CreateCustomerReviewInput) {
    return prisma.customerReview.create({
      data: {
        ...input,
        reviewDate: input.reviewDate ? new Date(input.reviewDate) : undefined,
      },
    });
  }

  static async update(id: string, input: UpdateCustomerReviewInput) {
    const existing = await prisma.customerReview.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("CustomerReview");
    }

    return prisma.customerReview.update({
      where: { id },
      data: {
        ...input,
        reviewDate: input.reviewDate ? new Date(input.reviewDate) : undefined,
      },
    });
  }

  static async delete(id: string) {
    const existing = await prisma.customerReview.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("CustomerReview");
    }

    await prisma.customerReview.delete({ where: { id } });
  }
}
