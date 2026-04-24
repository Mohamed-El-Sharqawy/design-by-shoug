import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateCollectionInput, UpdateCollectionInput } from "./model";

export abstract class CollectionService {
  static async getAll(includeInactive = false) {
    return prisma.collection.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  static async getById(id: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    return collection;
  }

  static async getBySlug(slug: string) {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: { product: { isActive: true } },
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                variants: {
                  where: { isActive: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    return collection;
  }

  static async create(input: CreateCollectionInput) {
    return prisma.collection.create({
      data: input,
    });
  }

  static async update(id: string, input: UpdateCollectionInput) {
    const existing = await prisma.collection.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Collection");
    }

    return prisma.collection.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.collection.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Collection");
    }

    await prisma.collection.delete({ where: { id } });
  }
}
