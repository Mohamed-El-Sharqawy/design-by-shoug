import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { CartService } from "@/modules/cart/service";
import type {
  CreateOrderInput,
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

    const shippingZone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: input.address?.city || "" },
      },
    });

    const shippingCost = shippingZone
      ? shippingZone.freeShippingMin && cart.subtotal >= Number(shippingZone.freeShippingMin)
        ? 0
        : Number(shippingZone.baseCost)
      : 0;

    const total = cart.total + shippingCost;

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

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || "guest",
        addressId,
        paymentMethod: input.paymentMethod,
        subtotal: cart.subtotal,
        shippingCost,
        discount: cart.discount,
        total,
        couponId: cart.coupon?.id,
        couponCode: cart.coupon?.code,
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

    if (cart.coupon) {
      await prisma.coupon.update({
        where: { id: cart.coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    await CartService.clearCart(userId, sessionId);

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
