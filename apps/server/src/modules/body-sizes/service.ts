import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateBodySizeInput, UpdateBodySizeInput } from "./model";

export abstract class BodySizeService {
  static async getAll(includeInactive = false) {
    return prisma.bodySize.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getById(id: string) {
    const size = await prisma.bodySize.findUnique({ where: { id } });

    if (!size) {
      throw new NotFoundError("BodySize");
    }

    return size;
  }

  static async create(input: CreateBodySizeInput) {
    return prisma.bodySize.create({ data: input });
  }

  static async update(id: string, input: UpdateBodySizeInput) {
    const existing = await prisma.bodySize.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("BodySize");
    }

    return prisma.bodySize.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.bodySize.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("BodySize");
    }

    await prisma.bodySize.delete({ where: { id } });
  }
}
