import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { AddToCartInput, UpdateCartItemInput, CustomMeasurements } from "./model";

export abstract class CartService {
  /**
   * Validates that size selection is complete:
   * - If isCustomSize is true, customMeasurements must be provided with all fields
   * - If isCustomSize is false/undefined, standard variant selection is used (already validated by variantId)
   */
  static validateSizeSelection(input: AddToCartInput): void {
    if (input.isCustomSize) {
      if (!input.customMeasurements) {
        throw new ValidationError(
          "Custom measurements are required when using custom size option"
        );
      }
      const { abayaLength, sleeveLength, bust, waist, hip } = input.customMeasurements;
      if (!abayaLength || !sleeveLength || !bust || !waist || !hip) {
        throw new ValidationError(
          "All custom measurements (Abaya length, Sleeve length, Bust, Waist, Hip) are required"
        );
      }
    }
  }

  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new ValidationError("Either userId or sessionId is required");
    }

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
                abayaLength: true,
                bodySize: true,
                color: true,
              },
            },
          },
        },
        coupon: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isPrimary: true }, take: 1 },
                    },
                  },
                  abayaLength: true,
                  bodySize: true,
                  color: true,
                },
              },
            },
          },
          coupon: true,
        },
      });
    }

    return cart;
  }

  static async getCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.calculateCartTotals(cart);
  }

  static async addItem(input: AddToCartInput, userId?: string, sessionId?: string) {
    // Validate size selection (standard or custom)
    this.validateSizeSelection(input);

    const cart = await this.getOrCreateCart(userId, sessionId);

    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant");
    }

    if (!variant.isActive || !variant.product.isActive) {
      throw new ValidationError("This product is not available");
    }

    if (variant.stock < input.quantity) {
      throw new ValidationError(`Only ${variant.stock} items available in stock`);
    }

    // For custom sizes, we create a new cart item even if same variant exists
    // because custom measurements make it a unique item
    const isCustomSize = input.isCustomSize || false;
    const customMeasurements = input.customMeasurements;

    // Find existing item only if NOT custom size
    const existingItem = !isCustomSize
      ? cart.items.find((item) => item.variantId === input.variantId && !item.isCustomSize)
      : null;

    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (variant.stock < newQuantity) {
        throw new ValidationError(`Only ${variant.stock} items available in stock`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: newQuantity,
          note: input.note || existingItem.note,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: input.variantId,
          quantity: input.quantity,
          isCustomSize,
          customMeasurements,
          note: input.note,
        },
      });
    }

    return this.getCart(userId, sessionId);
  }

  static async updateItem(
    itemId: string,
    input: UpdateCartItemInput,
    userId?: string,
    sessionId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundError("Cart item");
    }

    const updateData: { quantity?: number; note?: string } = {};

    if (input.quantity !== undefined) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (variant && variant.stock < input.quantity) {
        throw new ValidationError(`Only ${variant.stock} items available in stock`);
      }
      updateData.quantity = input.quantity;
    }

    if (input.note !== undefined) {
      updateData.note = input.note;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return this.getCart(userId, sessionId);
  }

  static async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundError("Cart item");
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId, sessionId);
  }

  static async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return this.getCart(userId, sessionId);
  }

  static async applyCoupon(code: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundError("Coupon");
    }

    if (!coupon.isActive) {
      throw new ValidationError("This coupon is no longer active");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ValidationError("This coupon has expired");
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      throw new ValidationError("This coupon is not yet active");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError("This coupon has reached its usage limit");
    }

    if (coupon.perUserLimit > 0 && !userId) {
      throw new ValidationError("Please log in to use this coupon");
    }

    if (coupon.perUserLimit > 0 && userId) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId,
          couponId: coupon.id,
          status: { notIn: ["CANCELLED"] },
        },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError("You have already used this coupon");
      }
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    return this.getCart(userId, sessionId);
  }

  static async removeCoupon(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return this.getCart(userId, sessionId);
  }

  static async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return;
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existingItem = userCart.items.find((i) => i.variantId === item.variantId);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  static async mergeItems(userId: string, items: { variantId: string; quantity: number }[]) {
    const cart = await this.getOrCreateCart(userId);

    for (const item of items) {
      const existing = cart.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    return this.getCart(userId);
  }

  private static calculateCartTotals(cart: any) {
    let subtotal = 0;
    let discount = 0;

    const itemsWithPrices = cart.items.map((item: any) => {
      const basePrice = Number(item.variant.product.salePrice || item.variant.product.basePrice);
      const priceAdjustment = Number(item.variant.priceAdjustment || 0);
      const unitPrice = basePrice + priceAdjustment;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        ...item,
        unitPrice,
        totalPrice,
      };
    });

    if (cart.coupon) {
      if (cart.coupon.minOrderAmount && subtotal < Number(cart.coupon.minOrderAmount)) {
        discount = 0;
      } else {
        if (cart.coupon.type === "PERCENTAGE") {
          discount = subtotal * (Number(cart.coupon.value) / 100);
        } else if (cart.coupon.type === "FIXED_AMOUNT") {
          discount = Number(cart.coupon.value);
        }

        if (cart.coupon.maxDiscount) {
          discount = Math.min(discount, Number(cart.coupon.maxDiscount));
        }
      }
    }

    return {
      ...cart,
      items: itemsWithPrices,
      subtotal,
      discount,
      total: subtotal - discount,
      freeShipping: cart.coupon?.type === "FREE_SHIPPING",
    };
  }
}
