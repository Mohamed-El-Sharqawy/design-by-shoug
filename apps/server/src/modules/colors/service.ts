import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateColorInput, UpdateColorInput } from "./model";

export abstract class ColorService {
  static async getAll(includeInactive = false) {
    return prisma.color.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getById(id: string) {
    const color = await prisma.color.findUnique({ where: { id } });

    if (!color) {
      throw new NotFoundError("Color");
    }

    return color;
  }

  static async create(input: CreateColorInput) {
    return prisma.color.create({ data: input });
  }

  static async update(id: string, input: UpdateColorInput) {
    const existing = await prisma.color.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Color");
    }

    return prisma.color.update({
      where: { id },
      data: input,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.color.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Color");
    }

    await prisma.color.delete({ where: { id } });
  }
}
