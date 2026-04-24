import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CreateCouponInput, UpdateCouponInput } from "./model";

export abstract class CouponService {
  static async getAll(includeInactive = false) {
    return prisma.coupon.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundError("Coupon");
    return coupon;
  }

  static async getByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) throw new NotFoundError("Coupon");
    return coupon;
  }

  static async create(input: CreateCouponInput) {
    const existing = await prisma.coupon.findUnique({
      where: { code: input.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictError("Coupon code already exists");
    }

    return prisma.coupon.create({
      data: {
        ...input,
        code: input.code.toUpperCase(),
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
  }

  static async update(id: string, input: UpdateCouponInput) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Coupon");

    if (input.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: {
          code: input.code.toUpperCase(),
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictError("Coupon code already exists");
      }
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...input,
        code: input.code?.toUpperCase(),
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      },
    });
  }

  static async delete(id: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Coupon");

    await prisma.coupon.delete({ where: { id } });
  }

  static async validateCoupon(code: string, orderAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, message: "Coupon not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is not active" };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      return { valid: false, message: "Coupon is not yet active" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        message: `Minimum order amount is AED ${coupon.minOrderAmount}`,
      };
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = orderAmount * (Number(coupon.value) / 100);
    } else if (coupon.type === "FIXED_AMOUNT") {
      discount = Number(coupon.value);
    }

    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    return {
      valid: true,
      coupon,
      discount,
    };
  }
}
