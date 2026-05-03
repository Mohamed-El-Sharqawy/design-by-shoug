import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";

export abstract class WishlistService {
  static async getWishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: {
              where: { isActive: true },
              take: 1,
              orderBy: { priceAdjustment: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return items;
  }

  static async addItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product");

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictError("Product already in wishlist");

    return prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  static async removeItem(userId: string, productId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundError("Wishlist item");

    await prisma.wishlistItem.delete({ where: { id: item.id } });
  }
}
