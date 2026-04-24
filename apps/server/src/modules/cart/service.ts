import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { AddToCartInput, UpdateCartItemInput } from "./model";

export abstract class CartService {
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

    const existingItem = cart.items.find((item) => item.variantId === input.variantId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (variant.stock < newQuantity) {
        throw new ValidationError(`Only ${variant.stock} items available in stock`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: input.variantId,
          quantity: input.quantity,
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

    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });

    if (variant && variant.stock < input.quantity) {
      throw new ValidationError(`Only ${variant.stock} items available in stock`);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
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
    };
  }
}
