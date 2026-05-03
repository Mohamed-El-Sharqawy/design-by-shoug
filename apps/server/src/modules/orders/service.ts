import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { CartService } from "@/modules/cart/service";
import { CouponService } from "@/modules/coupons/service";
import type {
  CreateOrderInput,
  DirectPurchaseInput,
  UpdateOrderStatusInput,
  OrderQueryInput,
} from "./model";
import type { Prisma } from "@generated/prisma/client";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DBS-${timestamp}-${random}`;
}

export abstract class OrderService {
  private static async resolveCoupon(
    couponCode: string | undefined,
    orderAmount: number,
    userId?: string
  ) {
    if (!couponCode) return { couponId: null, couponCode: null, discount: 0, isFreeShipping: false };

    const result = await CouponService.validateCoupon(couponCode, orderAmount, userId);
    if (!result.valid || !result.coupon) {
      throw new ValidationError(result.message || "Invalid coupon");
    }

    return {
      couponId: result.coupon.id,
      couponCode: result.coupon.code,
      discount: result.discount,
      isFreeShipping: result.coupon.type === "FREE_SHIPPING",
    };
  }

  static async create(
    input: CreateOrderInput,
    userId?: string,
    sessionId?: string
  ) {
    const cart = await CartService.getCart(userId, sessionId);

    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    let addressId = input.addressId;

    if (!addressId && input.address) {
      if (!userId) {
        const tempAddress = await prisma.address.create({
          data: {
            ...input.address,
            userId: "guest",
          },
        });
        addressId = tempAddress.id;
      } else {
        const newAddress = await prisma.address.create({
          data: {
            ...input.address,
            userId,
          },
        });
        addressId = newAddress.id;
      }
    }

    if (!addressId) {
      throw new ValidationError("Shipping address is required");
    }

    for (const item of cart.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || variant.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for ${item.variant.product.nameEn}`
        );
      }
    }

    const couponCode = input.couponCode || cart.coupon?.code;
    const coupon = await this.resolveCoupon(couponCode, cart.subtotal, userId);

    const shippingZone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: input.address?.city || "" },
      },
    });

    let shippingCost = shippingZone
      ? shippingZone.freeShippingMin && cart.subtotal >= Number(shippingZone.freeShippingMin)
        ? 0
        : Number(shippingZone.baseCost)
      : 0;

    if (coupon.isFreeShipping) {
      shippingCost = 0;
    }

    const discount = coupon.discount;
    const total = cart.subtotal - discount + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || "guest",
        addressId,
        paymentMethod: input.paymentMethod,
        subtotal: cart.subtotal,
        shippingCost,
        discount,
        total,
        couponId: coupon.couponId,
        couponCode: coupon.couponCode,
        notesCustomer: input.notesCustomer,
        items: {
          create: cart.items.map((item: any) => ({
            variantId: item.variantId,
            productNameEn: item.variant.product.nameEn,
            productNameAr: item.variant.product.nameAr,
            variantDetails: `${item.variant.abayaLength.labelEn} / ${item.variant.bodySize.labelEn}${item.variant.color ? ` / ${item.variant.color.nameEn}` : ""}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            isCustomSize: item.isCustomSize || false,
            customMeasurements: item.customMeasurements,
            note: item.note,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    for (const item of cart.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });

      await prisma.product.update({
        where: { id: item.variant.product.id },
        data: { soldCount: { increment: item.quantity } },
      });
    }

    if (coupon.couponId) {
      await prisma.coupon.update({
        where: { id: coupon.couponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    let paymentIntent = null;
    if (input.paymentMethod !== "CASH_ON_DELIVERY") {
      paymentIntent = await createPaymentIntent({
        amount: total,
        currency: "aed",
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        customerEmail: input.email,
      });
    }

    const customerEmail = input.email || (userId ? (await prisma.user.findUnique({ where: { id: userId } }))?.email : null);

    if (customerEmail) {
      try {
        await sendOrderConfirmationEmail(customerEmail, order.orderNumber, {
          items: order.items.map((item) => ({
            name: item.productNameEn,
            quantity: item.quantity,
            price: `AED ${Number(item.totalPrice).toFixed(2)}`,
          })),
          subtotal: `AED ${Number(order.subtotal).toFixed(2)}`,
          shipping: `AED ${Number(order.shippingCost).toFixed(2)}`,
          total: `AED ${Number(order.total).toFixed(2)}`,
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }

    return {
      order,
      paymentIntent: paymentIntent
        ? { clientSecret: paymentIntent.client_secret }
        : null,
    };
  }

  /**
   * Direct purchase: Create an order for a single item without using the cart.
   * Validates size selection (standard or custom) the same way as cart.
   */
  static async directPurchase(input: DirectPurchaseInput, userId?: string) {
    CartService.validateSizeSelection({
      variantId: input.variantId,
      quantity: input.quantity,
      isCustomSize: input.isCustomSize,
      customMeasurements: input.customMeasurements,
    });

    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: {
        product: true,
        abayaLength: true,
        bodySize: true,
        color: true,
      },
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

    const basePrice = Number(variant.product.salePrice || variant.product.basePrice);
    const priceAdjustment = Number(variant.priceAdjustment || 0);
    const unitPrice = basePrice + priceAdjustment;
    const subtotal = unitPrice * input.quantity;

    const coupon = await this.resolveCoupon(input.couponCode, subtotal, userId);

    let addressId = input.addressId;
    if (!addressId && input.address) {
      const newAddress = await prisma.address.create({
        data: {
          ...input.address,
          userId: userId || "guest",
        },
      });
      addressId = newAddress.id;
    }

    if (!addressId) {
      throw new ValidationError("Shipping address is required");
    }

    const shippingZone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: input.address?.city || "" },
      },
    });

    let shippingCost = shippingZone
      ? shippingZone.freeShippingMin && subtotal >= Number(shippingZone.freeShippingMin)
        ? 0
        : Number(shippingZone.baseCost)
      : 0;

    if (coupon.isFreeShipping) {
      shippingCost = 0;
    }

    const discount = coupon.discount;
    const total = subtotal - discount + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || "guest",
        addressId,
        paymentMethod: input.paymentMethod,
        subtotal,
        shippingCost,
        discount,
        total,
        couponId: coupon.couponId,
        couponCode: coupon.couponCode,
        notesCustomer: input.notesCustomer,
        items: {
          create: {
            variantId: input.variantId,
            productNameEn: variant.product.nameEn,
            productNameAr: variant.product.nameAr,
            variantDetails: `${variant.abayaLength.labelEn} / ${variant.bodySize.labelEn}${variant.color ? ` / ${variant.color.nameEn}` : ""}`,
            quantity: input.quantity,
            unitPrice,
            totalPrice: subtotal,
            isCustomSize: input.isCustomSize || false,
            customMeasurements: input.customMeasurements,
            note: input.note,
          },
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    await prisma.productVariant.update({
      where: { id: input.variantId },
      data: { stock: { decrement: input.quantity } },
    });

    await prisma.product.update({
      where: { id: variant.product.id },
      data: { soldCount: { increment: input.quantity } },
    });

    if (coupon.couponId) {
      await prisma.coupon.update({
        where: { id: coupon.couponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    let paymentIntent = null;
    if (input.paymentMethod !== "CASH_ON_DELIVERY") {
      paymentIntent = await createPaymentIntent({
        amount: total,
        currency: "aed",
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        customerEmail: input.email,
      });
    }

    const customerEmail = input.email || (userId ? (await prisma.user.findUnique({ where: { id: userId } }))?.email : null);

    if (customerEmail) {
      try {
        await sendOrderConfirmationEmail(customerEmail, order.orderNumber, {
          items: order.items.map((item) => ({
            name: item.productNameEn,
            quantity: item.quantity,
            price: `AED ${Number(item.totalPrice).toFixed(2)}`,
          })),
          subtotal: `AED ${Number(order.subtotal).toFixed(2)}`,
          shipping: `AED ${Number(order.shippingCost).toFixed(2)}`,
          total: `AED ${Number(order.total).toFixed(2)}`,
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }

    return {
      order,
      paymentIntent: paymentIntent
        ? { clientSecret: paymentIntent.client_secret }
        : null,
    };
  }

  static async getById(id: string, userId?: string) {
    const where: Prisma.OrderWhereUniqueInput = { id };

    const order = await prisma.order.findUnique({
      where,
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
              },
            },
          },
        },
        address: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (userId && order.userId !== userId && order.userId !== "guest") {
      throw new NotFoundError("Order");
    }

    return order;
  }

  static async getByOrderNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    return order;
  }

  static async getUserOrders(userId: string, query: OrderQueryInput) {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };

    if (query.status) {
      where.status = query.status as any;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAllOrders(query: OrderQueryInput) {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          address: true,
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateStatus(id: string, input: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundError("Order");
    }

    const updateData: Prisma.OrderUpdateInput = {
      status: input.status,
      notesInternal: input.notesInternal,
    };

    if (input.status === "SHIPPED") {
      updateData.shippedAt = new Date();
    } else if (input.status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    } else if (input.status === "CANCELLED") {
      updateData.cancelledAt = new Date();

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of orderItems) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        address: true,
      },
    });
  }

  static async confirmPayment(orderId: string, paymentIntentId: string) {
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new ValidationError("Payment not completed");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });
  }
}
