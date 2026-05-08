import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductQueryInput,
  ProductImageInput,
  BulkVariantInput,
} from "./model";
import type { Prisma } from "@generated/prisma/client";

export abstract class ProductService {
  static async getAll(query: ProductQueryInput) {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { nameAr: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === "true";
    }

    if (query.isNewArrival !== undefined) {
      where.isNewArrival = query.isNewArrival === "true";
    }

    if (query.collectionId) {
      where.collections = {
        some: { collectionId: query.collectionId },
      };
    }

    if (query.minPrice) {
      where.basePrice = { ...((where.basePrice as object) || {}), gte: parseFloat(query.minPrice) };
    }
    if (query.maxPrice) {
      where.basePrice = { ...((where.basePrice as object) || {}), lte: parseFloat(query.maxPrice) };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (query.sortBy) {
      const order = query.sortOrder === "desc" ? "desc" : "asc";
      if (query.sortBy === "price") {
        orderBy.basePrice = order;
      } else if (query.sortBy === "name") {
        orderBy.nameEn = order;
      } else if (query.sortBy === "createdAt") {
        orderBy.createdAt = order;
      } else if (query.sortBy === "soldCount") {
        orderBy.soldCount = order;
      }
    } else {
      orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: {
            where: { isActive: true },
            include: {
              abayaLength: true,
              color: true,
            },
          },
          collections: {
            include: { collection: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizeGuideImages: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { isActive: true },
          include: {
            abayaLength: true,
            color: true,
          },
          orderBy: [
            { abayaLength: { sortOrder: "asc" } },
          ],
        },
        collections: {
          include: { collection: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    return product;
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizeGuideImages: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { isActive: true },
          include: {
            abayaLength: true,
            color: true,
          },
          orderBy: [
            { abayaLength: { sortOrder: "asc" } },
          ],
        },
        collections: {
          include: { collection: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  static async getVariantById(variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        abayaLength: true,
        color: true,
      },
    });

    if (!variant) {
      throw new NotFoundError("Product variant");
    }

    return variant;
  }

  static async create(input: CreateProductInput) {
    const { collectionIds, images, variants, ...productData } = input;

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                altTextEn: img.altTextEn,
                altTextAr: img.altTextAr,
                isPrimary: img.isPrimary ?? false,
                sortOrder: img.sortOrder ?? index,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((v) => ({
                sku: v.sku,
                abayaLengthId: v.abayaLengthId,
                colorId: v.colorId,
                priceAdjustment: v.priceAdjustment ?? 0,
                stock: v.stock ?? 0,
                isActive: true,
              })),
            }
          : undefined,
        collections: collectionIds
          ? {
              create: collectionIds.map((collectionId, index) => ({
                collectionId,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { abayaLength: true, color: true },
        },
        collections: { include: { collection: true } },
      },
    });

    return product;
  }

  static async update(id: string, input: UpdateProductInput) {
    const { collectionIds, images, variants, ...productData } = input;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            url: img.url,
            altTextEn: img.altTextEn,
            altTextAr: img.altTextAr,
            isPrimary: img.isPrimary ?? false,
            sortOrder: img.sortOrder ?? index,
          })),
        });
      }
    }

    if (variants !== undefined) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true, abayaLengthId: true, colorId: true },
      });

      const newKeys = new Set(variants.map((v) => `${v.abayaLengthId}:${v.colorId ?? "null"}`));

      const toDelete = existingVariants.filter(
        (ev) => !newKeys.has(`${ev.abayaLengthId}:${ev.colorId ?? "null"}`)
      );

      const hasOrderItems = await prisma.orderItem.findFirst({
        where: { variantId: { in: toDelete.map((v) => v.id) } },
      });

      if (hasOrderItems) {
        const toSoftDelete = toDelete.map((v) => v.id);
        await prisma.productVariant.updateMany({
          where: { id: { in: toSoftDelete } },
          data: { isActive: false },
        });
      } else {
        await prisma.productVariant.deleteMany({
          where: { id: { in: toDelete.map((v) => v.id) } },
        });
      }

      for (const v of variants) {
        const existing = existingVariants.find(
          (ev) => ev.abayaLengthId === v.abayaLengthId && (ev.colorId ?? null) === (v.colorId ?? null)
        );
        if (existing) {
          await prisma.productVariant.update({
            where: { id: existing.id },
            data: {
              sku: v.sku,
              priceAdjustment: v.priceAdjustment ?? 0,
              stock: v.stock ?? 0,
              isActive: true,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              abayaLengthId: v.abayaLengthId,
              colorId: v.colorId,
              priceAdjustment: v.priceAdjustment ?? 0,
              stock: v.stock ?? 0,
              isActive: true,
            },
          });
        }
      }
    }

    if (collectionIds !== undefined) {
      await prisma.productCollection.deleteMany({
        where: { productId: id },
      });

      if (collectionIds.length > 0) {
        await prisma.productCollection.createMany({
          data: collectionIds.map((collectionId, index) => ({
            productId: id,
            collectionId,
            sortOrder: index,
          })),
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { abayaLength: true, color: true },
        },
        collections: { include: { collection: true } },
      },
    });

    return product;
  }

  static async delete(id: string) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    await prisma.product.delete({ where: { id } });
  }

  static async createVariant(input: CreateVariantInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    const variant = await prisma.productVariant.create({
      data: input,
      include: {
        abayaLength: true,
        color: true,
      },
    });

    return variant;
  }

  static async updateVariant(variantId: string, input: UpdateVariantInput) {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      throw new NotFoundError("Product variant");
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: input,
      include: {
        abayaLength: true,
        color: true,
      },
    });

    return variant;
  }

  static async deleteVariant(variantId: string) {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      throw new NotFoundError("Product variant");
    }

    await prisma.productVariant.delete({ where: { id: variantId } });
  }

  static async updateStock(variantId: string, quantity: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: quantity },
    });
  }

  static async adjustStock(variantId: string, adjustment: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: adjustment } },
    });
  }

  static async setImages(productId: string, images: ProductImageInput[]) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new NotFoundError("Product");

    await prisma.productImage.deleteMany({ where: { productId } });

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId,
          url: img.url,
          altTextEn: img.altTextEn,
          altTextAr: img.altTextAr,
          isPrimary: img.isPrimary ?? false,
          sortOrder: img.sortOrder ?? index,
        })),
      });
    }

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async bulkCreateVariants(productId: string, variants: BulkVariantInput) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new NotFoundError("Product");

    await prisma.productVariant.deleteMany({ where: { productId } });

    const created = [];
    for (const v of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          sku: v.sku,
          productId,
          abayaLengthId: v.abayaLengthId,
          colorId: v.colorId,
          priceAdjustment: v.priceAdjustment ?? 0,
          stock: v.stock ?? 0,
          lowStockAlert: v.lowStockAlert ?? 5,
          isActive: v.isActive ?? true,
        },
        include: {
          abayaLength: true,
          color: true,
        },
      });
      created.push(variant);
    }

    return created;
  }
}
