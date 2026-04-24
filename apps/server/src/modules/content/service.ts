import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type {
  CreateBannerInput,
  UpdateBannerInput,
  CreateInstagramPostInput,
  UpdateInstagramPostInput,
  CreateShoppableVideoInput,
  UpdateShoppableVideoInput,
  CreateFeaturedProductInput,
  UpdateFeaturedProductInput,
} from "./model";

export abstract class ContentService {
  static async getBanners(includeAll = false) {
    return prisma.banner.findMany({
      where: includeAll ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createBanner(input: CreateBannerInput) {
    return prisma.banner.create({ data: input });
  }

  static async updateBanner(id: string, input: UpdateBannerInput) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner");

    return prisma.banner.update({
      where: { id },
      data: input,
    });
  }

  static async deleteBanner(id: string) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner");

    await prisma.banner.delete({ where: { id } });
  }

  static async getInstagramPosts(includeAll = false) {
    return prisma.instagramPost.findMany({
      where: includeAll ? {} : { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createInstagramPost(input: CreateInstagramPostInput) {
    return prisma.instagramPost.create({ data: input });
  }

  static async updateInstagramPost(id: string, input: UpdateInstagramPostInput) {
    const existing = await prisma.instagramPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Instagram post");

    return prisma.instagramPost.update({
      where: { id },
      data: input,
    });
  }

  static async deleteInstagramPost(id: string) {
    const existing = await prisma.instagramPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Instagram post");

    await prisma.instagramPost.delete({ where: { id } });
  }

  static async getShoppableVideos(includeAll = false) {
    return prisma.shoppableVideo.findMany({
      where: includeAll ? {} : { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      include: {
        linkedProducts: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  static async createShoppableVideo(input: CreateShoppableVideoInput) {
    const { productIds, ...videoData } = input;

    return prisma.shoppableVideo.create({
      data: {
        ...videoData,
        linkedProducts: productIds
          ? {
              create: productIds.map((productId, index) => ({
                productId,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { linkedProducts: true },
    });
  }

  static async updateShoppableVideo(id: string, input: UpdateShoppableVideoInput) {
    const existing = await prisma.shoppableVideo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Shoppable video");

    const { productIds, ...videoData } = input;

    if (productIds !== undefined) {
      await prisma.shoppableVideoProduct.deleteMany({ where: { videoId: id } });

      if (productIds.length > 0) {
        await prisma.shoppableVideoProduct.createMany({
          data: productIds.map((productId, index) => ({
            videoId: id,
            productId,
            sortOrder: index,
          })),
        });
      }
    }

    return prisma.shoppableVideo.update({
      where: { id },
      data: videoData,
      include: { linkedProducts: true },
    });
  }

  static async deleteShoppableVideo(id: string) {
    const existing = await prisma.shoppableVideo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Shoppable video");

    await prisma.shoppableVideo.delete({ where: { id } });
  }

  static async getFeaturedProducts(includeAll = false) {
    const where: any = {};

    if (!includeAll) {
      where.isActive = true;
      where.OR = [
        { startsAt: null },
        { startsAt: { lte: new Date() } },
      ];
      where.AND = [
        { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] },
      ];
    }

    return prisma.featuredProduct.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  static async createFeaturedProduct(input: CreateFeaturedProductInput) {
    return prisma.featuredProduct.create({
      data: {
        ...input,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      },
      include: { product: true },
    });
  }

  static async updateFeaturedProduct(id: string, input: UpdateFeaturedProductInput) {
    const existing = await prisma.featuredProduct.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Featured product");

    return prisma.featuredProduct.update({
      where: { id },
      data: {
        ...input,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      },
      include: { product: true },
    });
  }

  static async deleteFeaturedProduct(id: string) {
    const existing = await prisma.featuredProduct.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Featured product");

    await prisma.featuredProduct.delete({ where: { id } });
  }
}
